const mockAxios = jest.genMockFromModule('axios')

mockAxios.create = jest.fn().mockImplementation((options = {}) => {
  mockAxios.defaults = { ...mockAxios.defaults, ...options }
  return mockAxios
})

mockAxios.mockResetAll = () => {
  ['get', 'post'].forEach(name => {
    mockAxios[name].mockReset()
  })
}

export default mockAxios
