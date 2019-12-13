//  https://github.com/faisalman/ua-parser-js
import UAParser from 'ua-parser-js'
import axios from 'axios'

class FirstPaintTiming {
  get requestUrl() {
    return (
      {
        test: 'https://fakeurl/api/v1/page',
        production: 'https://realUrl/api/v1/page'
      }[this.env] || false
    )
  }

  constructor(options = { env: 'test' }) {
    this.env = options.env
  }

  upload2Server() {
    try {
      requestUrl && axios.post(requestUrl, [this.getPageInfo()])
    } catch {}
  }

  getPageInfo() {
    return {
      ...this._getPagePerformance(),
      ...this._getPhysics()
    }
  }

  _getPagePerformance() {
    const [pagePerformance] = performance.getEntries()
    return {
      startTime: pagePerformance.startTime || pagePerformance.fetchStart,
      redirect: pagePerformance.redirectEnd - pagePerformance.redirectStart,
      dns: pagePerformance.domainLookupEnd - pagePerformance.domainLookupStart,
      tcp: pagePerformance.connectEnd - pagePerformance.connectStart,
      response: pagePerformance.responseEnd - pagePerformance.requestStart,
      interactive: pagePerformance.domInteractive - pagePerformance.responseEnd,
      content:
        pagePerformance.domContentLoadedEventEnd -
        pagePerformance.domContentLoadedEventStart,
      complete: pagePerformance.domComplete - pagePerformance.responseEnd,
      nextHopProtocol: pagePerformance.nextHopProtocol
    }
  }

  _getPhysics() {
    const uaParser = new UAParser().getResult()

    const { name: browserName, version: browserVersion } = uaParser.browser
    const { name: osName, version: osVersion } = uaParser.os
    return {
      os: `${browserName}${browserVersion}`,
      browser: `${osName}${osVersion}`
    }
  }
}
