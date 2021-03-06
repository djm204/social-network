import './env'
import { migrate } from './db'
import { start as startApi } from './api'
import { logger } from 'svcready'
import { profiles } from './domain/profile'
import { posts } from './domain/post'

export async function start() {
  try {
    await migrate()
    await startApi()
    startPopulators()
    logger.info('service ready')
  } catch (err) {
    logger.error({ err }, `failed to start service`)
  }
}

function startPopulators() {
  profiles.populator.start()
  profiles.relations.populator.start()
  profiles.follow.populator.start()
  posts.populator.start()
}
