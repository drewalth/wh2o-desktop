import { DataTypes, Sequelize } from 'sequelize'
import sqlite3 from 'sqlite3'

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  dialectModule: sqlite3,
  host: 'localhost',
  storage:
    process.env.NODE_ENV === 'development'
      ? 'dev_db.sqlite'
      : __dirname + '/db.sqlite',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

export const USGSFetchSchedule = sequelize.define(
  'usgs_fetch_schedule',
  {
    nextFetch: DataTypes.DATE,
  },
  {
    timestamps: false,
  }
)

export const Alert = sequelize.define(
  'alert',
  {
    name: DataTypes.STRING,
    criteria: DataTypes.STRING,
    minimum: DataTypes.INTEGER,
    maximum: DataTypes.INTEGER,
    value: DataTypes.INTEGER,
    metric: DataTypes.STRING,
  },
  {
    timestamps: true,
  }
)

export const Reading = sequelize.define(
  'reading',
  {
    value: DataTypes.INTEGER,
    metric: DataTypes.STRING,
  },
  {
    timestamps: true,
  }
)

export const Gage = sequelize.define(
  'gage',
  {
    name: DataTypes.STRING,
    siteId: DataTypes.STRING,
    source: DataTypes.STRING,
    metric: DataTypes.STRING,
    reading: DataTypes.INTEGER,
    delta: DataTypes.INTEGER,
    lastFetch: DataTypes.DATE,
  },
  {
    timestamps: true,
  }
)

Gage.hasMany(Reading)
Gage.hasMany(Alert)
Reading.belongsTo(Gage)
Alert.belongsTo(Gage, {
  foreignKey: 'gageId',
  foreignKeyConstraint: false,
})
;(async function () {
  await sequelize.sync({ force: false })
})()
