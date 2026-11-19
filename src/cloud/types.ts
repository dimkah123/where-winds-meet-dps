export interface UserProfile {
  id: string
  email: string
  name: string
  picture: string
}

export interface CloudBuildSummary {
  shortId: string
  title: string
  author: string
  classId: string
  dps: number
  lastUpdated: number
}

export interface LoadedCloudBuild {
  shortId: string
  title: string
  author: string
  classId: string
  dps: number
  data: string
  ownerId: string | null
  lastUpdated: number
}
