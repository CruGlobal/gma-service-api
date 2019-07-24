// axiosCookieJarSupport overwrites all the mocks on axios, so for testing we make it a no-op
const axiosCookieJarSupport = jest.fn()

export default axiosCookieJarSupport
