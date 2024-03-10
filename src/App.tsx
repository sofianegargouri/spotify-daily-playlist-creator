import { createEffect, type Component, createSignal, Show } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';
import { getSpotifyAuthenticationUrl } from './helpers/spotify';
import axios from 'axios';

const App: Component = () => {
  const [spotifyToken, setSpotifyToken] = createSignal(localStorage.getItem('spotifyToken'))
  const [refreshToken, setRefreshToken] = createSignal(localStorage.getItem('refreshToken'))

  const signinWithSpotify = async () => {
    const {url, codeVerifier} = await getSpotifyAuthenticationUrl()
    localStorage.setItem('spotifyCodeVerifier', codeVerifier)
    window.location.href = url
  }

  createEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const codeVerifier = localStorage.getItem('spotifyCodeVerifier')

    if (code && codeVerifier) {
      axios.post('/api/sign-in', {code, codeVerifier})
      .then(({data}) => {
        setRefreshToken(data.refreshToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        setSpotifyToken(data.accessToken)
        localStorage.setItem('spotifyToken', data.accessToken)
      })
    }
  })

    return (
      <>
      <Show when={!refreshToken()}>
      <div class={styles.App}>
        <header class={styles.header}>
          <img src={logo} class={styles.logo} alt="logo" />
          <button onClick={signinWithSpotify}>
            Sign in
          </button>
        </header>
      </div>
      </Show>
      <Show when={refreshToken()}>
        <></>
      </Show>
      </>
    );
};

export default App;
