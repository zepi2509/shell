#include "appdb.hpp"

#include <qsqldatabase.h>
#include <qsqlquery.h>
#include <quuid.h>

namespace caelestia {

AppEntry::AppEntry(QObject* entry, unsigned int frequency, QObject* parent)
    : QObject(parent)
    , m_entry(entry)
    , m_frequency(frequency) {
    const auto mo = m_entry->metaObject();
    const auto tmo = metaObject();

    for (const auto& prop :
        { "name", "comment", "execString", "startupClass", "genericName", "categories", "keywords" }) {
        const auto metaProp = mo->property(mo->indexOfProperty(prop));
        const auto thisMetaProp = tmo->property(tmo->indexOfProperty(prop));
        connect(m_entry, metaProp.notifySignal(), this, thisMetaProp.notifySignal());
    }
}

QObject* AppEntry::entry() const {
    return m_entry;
}

quint32 AppEntry::frequency() const {
    return m_frequency;
}

void AppEntry::setFrequency(unsigned int frequency) {
    if (m_frequency != frequency) {
        m_frequency = frequency;
        emit frequencyChanged();
    }
}

void AppEntry::incrementFrequency() {
    m_frequency++;
    emit frequencyChanged();
}

QString AppEntry::id() const {
    return m_entry->property("id").toString();
}

QString AppEntry::name() const {
    return m_entry->property("name").toString();
}

QString AppEntry::comment() const {
    return m_entry->property("comment").toString();
}

QString AppEntry::execString() const {
    return m_entry->property("execString").toString();
}

QString AppEntry::startupClass() const {
    return m_entry->property("startupClass").toString();
}

QString AppEntry::genericName() const {
    return m_entry->property("genericName").toString();
}

QString AppEntry::categories() const {
    return m_entry->property("categories").toStringList().join(" ");
}

QString AppEntry::keywords() const {
    return m_entry->property("keywords").toStringList().join(" ");
}

AppDb::AppDb(QObject* parent)
    : QObject(parent)
    , m_timer(new QTimer(this))
    , m_uuid(QUuid::createUuid().toString()) {
    m_timer->setSingleShot(true);
    m_timer->setInterval(300);
    connect(m_timer, &QTimer::timeout, this, &AppDb::updateApps);

    auto db = QSqlDatabase::addDatabase("QSQLITE", m_uuid);
    db.setDatabaseName(":memory:");
    db.open();

    QSqlQuery query(db);
    query.exec("CREATE TABLE IF NOT EXISTS frequencies (id TEXT PRIMARY KEY, frequency INTEGER)");
}

QString AppDb::uuid() const {
    return m_uuid;
}

QString AppDb::path() const {
    return m_path;
}

void AppDb::setPath(const QString& path) {
    auto newPath = path.isEmpty() ? ":memory:" : path;

    if (m_path == newPath) {
        return;
    }

    m_path = newPath;
    emit pathChanged();

    auto db = QSqlDatabase::database(m_uuid, false);
    db.close();
    db.setDatabaseName(newPath);
    db.open();

    QSqlQuery query(db);
    query.exec("CREATE TABLE IF NOT EXISTS frequencies (id TEXT PRIMARY KEY, frequency INTEGER)");

    updateAppFrequencies();
}

QList<QObject*> AppDb::entries() const {
    return m_entries;
}

void AppDb::setEntries(const QList<QObject*>& entries) {
    if (m_entries == entries) {
        return;
    }

    m_entries = entries;
    emit entriesChanged();

    m_timer->start();
}

QList<AppEntry*> AppDb::apps() const {
    auto apps = m_apps.values();
    std::sort(apps.begin(), apps.end(), [](AppEntry* a, AppEntry* b) {
        if (a->frequency() != b->frequency()) {
            return a->frequency() > b->frequency();
        }
        return a->name().localeAwareCompare(b->name()) < 0;
    });
    return apps;
}

void AppDb::incrementFrequency(const QString& id) {
    auto db = QSqlDatabase::database(m_uuid);
    QSqlQuery query(db);

    query.prepare("INSERT INTO frequencies (id, frequency) "
                  "VALUES (:id, 1) "
                  "ON CONFLICT (id) DO UPDATE SET frequency = frequency + 1");
    query.bindValue(":id", id);
    query.exec();

    for (auto app : m_apps) {
        if (app->id() == id) {
            const auto before = apps();

            app->incrementFrequency();

            if (before != apps()) {
                emit appsChanged();
            }

            return;
        }
    }

    qWarning() << "AppDb::incrementFrequency: could not find app with id" << id;
}

quint32 AppDb::getFrequency(const QString& id) const {
    auto db = QSqlDatabase::database(m_uuid);
    QSqlQuery query(db);

    query.prepare("SELECT frequency FROM frequencies WHERE id = :id");
    query.bindValue(":id", id);

    if (query.exec() && query.next()) {
        return query.value(0).toUInt();
    }

    return 0;
}

void AppDb::updateAppFrequencies() {
    for (auto app : m_apps) {
        app->setFrequency(getFrequency(app->id()));
    }
}

void AppDb::updateApps() {
    bool dirty = false;

    for (auto entry : m_entries) {
        const auto id = entry->property("id").toString();
        if (!m_apps.contains(id)) {
            dirty = true;
            m_apps.insert(id, new AppEntry(entry, getFrequency(id), this));
        }
    }

    QSet<QString> newIds;
    for (auto entry : m_entries) {
        newIds.insert(entry->property("id").toString());
    }

    for (auto id : m_apps.keys()) {
        if (!newIds.contains(id)) {
            dirty = true;
            m_apps.take(id)->deleteLater();
        }
    }

    if (dirty) {
        emit appsChanged();
    }
}

} // namespace caelestia
