export interface Contributor {
  login: string
  avatarUrl: string
  profileUrl: string
}

export const SOLE_CONTRIBUTOR: Contributor = {
  login: "dimkah123",
  avatarUrl: "https://github.com/dimkah123.png",
  profileUrl: "https://github.com/dimkah123",
}

export const CONTRIBUTORS_CACHE_KEY = "wwm.contributors"

export function loadContributors(): Promise<Contributor[]> {
  return Promise.resolve([SOLE_CONTRIBUTOR])
}
