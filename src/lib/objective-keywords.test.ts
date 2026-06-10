import { describe, it, expect } from 'vitest'
import { extractKeywords, findUncovered } from './objective-keywords'

describe('extractKeywords', () => {
  it('splits on top-level commas, not commas inside parentheses', () => {
    const kws = extractKeywords('Common ports (21,22,23,443), TCP vs UDP, DNS, DHCP.')
    expect(kws).toEqual(['Common ports', 'TCP vs UDP', 'DNS', 'DHCP'])
  })

  it('drops trailing periods, tiny fragments, and etc.', () => {
    const kws = extractKeywords('RAID levels, SSD form factors, etc.')
    expect(kws).toEqual(['RAID levels', 'SSD form factors'])
  })
})

describe('findUncovered', () => {
  const texts = [
    'Which port does DNS use? 53. DNS resolves names.',
    'TCP is connection-oriented while UDP is connectionless.',
  ]

  it('covers keywords whose tokens all appear in one item', () => {
    expect(findUncovered(['DNS', 'TCP vs UDP'], texts)).toEqual([])
  })

  it('reports keywords no single item exercises', () => {
    expect(findUncovered(['DHCP', 'VLANs'], texts)).toEqual(['DHCP', 'VLANs'])
  })

  it('does not mark covered when tokens are split across items', () => {
    const split = ['Only TCP appears here as a protocol.', 'Only UDP appears here on its own.']
    expect(findUncovered(['TCP vs UDP'], split)).toEqual(['TCP vs UDP'])
  })

  it('matches case-insensitively', () => {
    expect(findUncovered(['dns'], ['DNS records explained'])).toEqual([])
  })

  it('treats hyphen/slash variants as equal (WiFi vs Wi-Fi, HTTP/S vs HTTPS)', () => {
    expect(findUncovered(['WiFi'], ['Configuring Wi-Fi networks'])).toEqual([])
    expect(findUncovered(['HTTP/S'], ['HTTPS uses TCP 443'])).toEqual([])
  })
})
