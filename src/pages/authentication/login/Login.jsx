/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';
import { useAuth } from '../../../components/common/context/AuthContext';
import { postEvent } from '../../../helpers/Api';
import jwtDecode from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';

const initOptions = {
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: '',
  clientId: '',
  onLoad: 'login-required',
  responseType: 'code',
  grantType: 'password',
};
const getRealmFromSubdomain = () => {
  const subdomain = window.location.hostname.split('.')[0];
  if (subdomain === 'localhost') {
    return 'master';
  } else {
    return subdomain;
  }
};

const Login = () => {
  const { authenticated, setAuthenticated } = useAuth();
  const [keycloak, setKeycloak] = useState(null);
  const [auth, setAuth] = useState(false);
  const realm = getRealmFromSubdomain();
  initOptions.realm = realm;
  initOptions.clientId = realm;
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || null;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keycloakIdentity = queryParams.get('keycloakIdentity') || null;
  const username = queryParams.get('username') || null;

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const newToken = async (username) => {
    const body = {
      username: username,
    };
    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    let data = await response.json();
    return data?.data;
  };

  useEffect(() => {
    if (username && keycloakIdentity) {
      if (token) {
        navigate('/');
      }
    } else {
      if (authenticated) {
        if (token) {
          navigate('/');
        } else {
          localStorage.clear();
          authenticated.logout();
          navigate('/login');
        }
      }
    }
  }, [authenticated, token]);

  if (!keycloakIdentity) {
    useEffect(() => {
      const keycloakInstance = new Keycloak(initOptions);
      setKeycloak(keycloakInstance);
    }, []);
    useEffect(() => {
      if (keycloak) {
        keycloak
          .init({
            onLoad: initOptions.onLoad,
            responseType: initOptions.responseType,
          })
          .then(async (auth) => {
            if (!auth) {
              console.log('no auth');
              // window.location.reload();
            } else {
              if (localStorage?.getItem('isLogout') === 'true') {
                localStorage.clear();
                await keycloak?.logout();
                await keycloak?.clearToken();
                return;
              }
              const userProfile = keycloak.tokenParsed?.preferred_username;
              if (userProfile) {
                localStorage.setItem('user_name', userProfile);
                const userToken = await newToken(userProfile);
                if (userToken?.token) {
                  const user = jwtDecode(userToken.token);
                  const event = {
                    email: user?.email,
                    activity: 'Login',
                    page_name: 'login',
                    status: 'Success',
                    eventType: 'LOGIN_SUCCESS',
                  };
                  postEvent(event);
                  localStorage.setItem('token', userToken.token);
                  localStorage.setItem('KC_token', keycloak.token);
                  localStorage.setItem('refreshToken', keycloak.refreshToken);
                  setAuth(true);
                  setAuthenticated(keycloak);
                } else {
                  await logout();
                }
              } else {
                await logout();
              }
            }
            setTimeout(() => {
              keycloak
                .updateToken(70)
                .then((refreshed) => {
                  if (refreshed) {
                    console.debug('Token refreshed' + refreshed);
                  } else {
                    console.warn(
                      'Token not refreshed, valid for ' +
                        Math.round(
                          keycloak.tokenParsed.exp +
                            keycloak.timeSkew -
                            new Date().getTime() / 1000
                        ) +
                        ' seconds'
                    );
                  }
                })
                .catch(() => {
                  console.error('Failed to refresh token');
                });
            }, 60000);

            if (localStorage.getItem('token') && authenticated) {
              navigate('/');
            }
          })
          .catch(async (e) => {
            console.error('Authentication Failed', e);
            await logout();
          });
      } else {
        setAuthenticated(null);
      }
    }, [keycloak, setAuthenticated, navigate]);
  } else {
    useEffect(() => {
      const handleTokenAndNavigation = async () => {
        if (username && keycloakIdentity) {
          try {
            const userToken = await newToken(username);
            localStorage.setItem('user_name', username);
            localStorage.setItem('token', userToken.token);
            localStorage.setItem('KC_token', keycloakIdentity);
            setAuth(true);
            navigate('/');
          } catch (error) {
            console.error('Error handling token and navigation:', error);
          }
        }
      };

      handleTokenAndNavigation();
    }, [username, keycloakIdentity, navigate]);
  }

  async function logout() {
    localStorage.clear();
    keycloak?.logout();
    navigate('/login');
  }

  if (auth) {
    return <p>Authenticated</p>;
  }

  return null;
};

export default Login;
