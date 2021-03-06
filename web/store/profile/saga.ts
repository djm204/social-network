import { saga, get, post } from '../store'
import { Profile } from './reducer'

saga('PROFILE_REQUEST_SELF', async (_, dispatch) => {
  const res = await get<{ profile: Profile }>(`/profile`)

  if (res.status !== 200) {
    dispatch({ type: 'PROFILE_RECEIVE_SELF', error: res.statusText })
    return
  }

  dispatch({ type: 'PROFILE_RECEIVE_SELF', profile: res.data.profile })
})

saga('PROFILE_REQUEST_PROFILE', async ({ id }, dispatch) => {
  const requestId = id ? `/${id}` : ''
  const res = await get<{ profile: Profile }>(`/profile${requestId}`)

  if (res.status !== 200) {
    dispatch({ type: 'PROFILE_RECEIVE_PROFILE', error: res.statusText })
    return
  }

  dispatch({ type: 'PROFILE_RECEIVE_PROFILE', profile: res.data.profile })
})

saga(
  'PROFILE_REQUEST_UPDATE',
  async (
    { changes },
    dispatch,
    {
      profile: {
        view: { profile },
      },
    }
  ) => {
    const res = await post<{ message: string }>('/profile', changes)
    if (res.status > 200) {
      const error = res.data.message || res.statusText
      dispatch({
        type: 'NOTIFY_REQUEST',
        kind: 'error',
        text: `Failed to update profile: ${error}`,
      })
      dispatch({ type: 'PROFILE_RECEIVE_UPDATE', error })
    }

    dispatch({ type: 'PROFILE_RECEIVE_UPDATE', error: res.data.message || res.statusText })
    dispatch({ type: 'NOTIFY_REQUEST', text: 'Successfully updated profile', kind: 'success' })

    if (!profile) return
    const nextProfile = { ...profile }
    if (changes.description) nextProfile.description = changes.description
    if (changes.nickname) nextProfile.nickname = changes.nickname

    dispatch({ type: 'PROFILE_RECEIVE_PROFILE', profile: nextProfile })
  }
)

saga('USER_RECEIVE_LOGIN', async (_, dispatch) => {
  dispatch({ type: 'PROFILE_REQUEST_SELF' })
})

saga('PROFILE_REQUEST_FOLLOW', async (action, dispatch) => {
  const res = await post(`/profile/${action.userId}/follow`)
  const userId = action.userId
  const error = res.status > 200 ? res.data.message ?? res.statusText : undefined

  if (error) {
    dispatch({ type: 'NOTIFY_REQUEST', kind: 'error', text: `Failed to follow: ${error}` })
  } else {
    dispatch({ type: 'NOTIFY_REQUEST', kind: 'success', text: 'Followed user' })
  }

  dispatch({ type: 'PROFILE_RECEIVE_FOLLOW', userId, error })
})

saga('PROFILE_REQUEST_UNFOLLOW', async (action, dispatch) => {
  const res = await post(`/profile/${action.userId}/unfollow`)
  const userId = action.userId
  const error = res.status > 200 ? res.data.message ?? res.statusText : undefined

  if (error) {
    dispatch({ type: 'NOTIFY_REQUEST', kind: 'error', text: `Failed to unfollow: ${error}` })
  } else {
    dispatch({ type: 'NOTIFY_REQUEST', kind: 'success', text: 'Unfollowed user' })
  }

  dispatch({ type: 'PROFILE_RECEIVE_UNFOLLOW', userId, error })
})
