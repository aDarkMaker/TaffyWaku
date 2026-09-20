import { App } from 'aurorax'
import { loadConfig } from './config'
import { errorGuard, logger, voiceReply } from './middleware'

const config = loadConfig()

const app = new App({
  onebot: {
    type: 'ws-reverse',
    url: config.onebotUrl,
    ...(config.onebotToken ? { token: config.onebotToken } : {}),
  },
})

app.useMw(errorGuard).useMw(logger).useMw(voiceReply(config))

await app.start()
console.log(`[bot] listening on ${config.onebotUrl}`)
