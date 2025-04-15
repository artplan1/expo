import { jsx as B } from "react/jsx-runtime";
import { validateToken as D } from "@kinde/jwt-validator";
import { makeRedirectUri as X, revokeAsync as Q, TokenTypeHint as W, AuthRequest as Y, exchangeCodeAsync as ee } from "expo-auth-session";
import { openAuthSessionAsync as te } from "expo-web-browser";
import { createContext as ne, useState as re, useEffect as oe, useContext as se } from "react";
import ie from "expo-constants";
var x = /* @__PURE__ */ ((e) => (e.none = "none", e.create = "create", e.login = "login", e))(x || {});
const O = (e) => e.replace(/\/$/, ""), V = (e, n = !1) => {
  const t = {
    login_hint: e.loginHint,
    is_create_org: e.isCreateOrg?.toString(),
    connection_id: e.connectionId,
    redirect_uri: e.redirectURL ? n ? e.redirectURL : O(e.redirectURL) : void 0,
    audience: e.audience || "",
    scope: e.scope?.join(" ") || "email profile openid offline",
    prompt: e.prompt,
    lang: e.lang,
    org_code: e.orgCode,
    org_name: e.orgName,
    has_success_page: e.hasSuccessPage?.toString(),
    workflow_deployment_id: e.workflowDeploymentId
  };
  return Object.keys(t).forEach(
    (s) => t[s] === void 0 && delete t[s]
  ), t;
};
let C;
function j(e, n) {
  if (N(), typeof window > "u")
    throw new Error("setRefreshTimer requires a browser environment");
  if (e <= 0)
    throw new Error("Timer duration must be positive");
  C = window.setTimeout(n, e * 1e3 - 1e4);
}
function N() {
  C !== void 0 && (window.clearTimeout(C), C = void 0);
}
function ae(e, n) {
  if (!e)
    return null;
  const t = e.split(".");
  if (t.length !== 3)
    return null;
  const s = t[
    1
    /* body */
  ].replace(/-/g, "+").replace(/_/g, "/"), a = decodeURIComponent(
    atob(s).split("").map((g) => "%" + ("00" + g.charCodeAt(0).toString(16)).slice(-2)).join("")
  );
  return JSON.parse(a);
}
var c = /* @__PURE__ */ ((e) => (e.accessToken = "accessToken", e.idToken = "idToken", e.refreshToken = "refreshToken", e.state = "state", e.nonce = "nonce", e.codeVerifier = "codeVerifier", e))(c || {});
class ce {
  async setItems(n) {
    await Promise.all(
      Object.entries(n).map(
        ([t, s]) => this.setSessionItem(t, s)
      )
    );
  }
  async removeItems(...n) {
    await Promise.all(
      n.map((t) => this.removeSessionItem(t))
    );
  }
}
function de(e, n) {
  return n <= 0 ? [] : e.match(new RegExp(`.{1,${n}}`, "g")) || [];
}
let v;
async function U() {
  let e = 0;
  for (; !v && e < 20; )
    await new Promise((n) => setTimeout(n, 100)), e++;
}
class G extends ce {
  constructor() {
    super(), this.loadExpoStore();
  }
  async loadExpoStore() {
    try {
      v = await import("expo-secure-store");
    } catch (n) {
      console.error("Error loading dependency expo storage:", n);
    }
  }
  /**
   * Clears all items from session store.
   * @returns {void}
   */
  async destroySession() {
    Object.values(c).forEach(async (n) => {
      await this.removeSessionItem(n);
    });
  }
  /**
   * Sets the provided key-value store to ExpoSecureStore.
   * @param {string} itemKey
   * @param {unknown} itemValue
   * @returns {void}
   */
  async setSessionItem(n, t) {
    if (await U(), await this.removeSessionItem(n), typeof t == "string") {
      de(t, Math.min(y.maxLength, 2048)).forEach(
        async (s, a) => {
          await v.setItemAsync(
            `${y.keyPrefix}${n}${a}`,
            s
          );
        }
      );
      return;
    } else
      throw new Error("Item value must be a string");
  }
  /**
   * Gets the item for the provided key from the ExpoSecureStore.
   * @param {string} itemKey
   * @returns {unknown | null}
   */
  async getSessionItem(n) {
    await U();
    const t = [];
    let s = 0, a = await v.getItemAsync(
      `${y.keyPrefix}${String(n)}${s}`
    );
    for (; a; )
      t.push(a), s++, a = await v.getItemAsync(
        `${y.keyPrefix}${String(n)}${s}`
      );
    return t.join("") || null;
  }
  /**
   * Removes the item for the provided key from the ExpoSecureStore.
   * @param {string} itemKey
   * @returns {void}
   */
  async removeSessionItem(n) {
    await U();
    let t = 0, s = await v.getItemAsync(
      `${y.keyPrefix}${String(n)}${t}`
    );
    for (; s; )
      await v.deleteItemAsync(
        `${y.keyPrefix}${String(n)}${t}`
      ), t++, s = await v.getItemAsync(
        `${y.keyPrefix}${String(n)}${t}`
      );
  }
}
const y = {
  /**
   * The prefix to use for the storage keys.
   */
  keyPrefix: "kinde-",
  /**
   * The maximum length of the storage.
   *
   * If the length is exceeded the items will be split into multiple storage items.
   */
  maxLength: 2e3,
  /**
   * Use insecure storage for refresh token.
   *
   * Warning: This should only be used when you're not using a custom domain and no backend app to authenticate on.
   */
  useInsecureForRefreshToken: !1
}, I = async (e = c.accessToken) => {
  const n = b();
  if (!n)
    return null;
  const t = await n.getSessionItem(
    e === "accessToken" ? c.accessToken : c.idToken
  );
  if (!t)
    return null;
  const s = ae(t);
  return s || console.warn("No decoded token found"), s;
}, z = async (e = "accessToken") => I(e), F = async (e, n = "accessToken") => {
  const t = await z(n);
  return t ? {
    name: e,
    value: t[e]
  } : null;
}, ue = async () => (await F("org_code"))?.value || null, le = async (e) => {
  const n = (await F("feature_flags"))?.value;
  if (e && n) {
    const t = n[e];
    return t ? t?.v : null;
  }
  return null;
}, fe = async () => {
  const e = await z("idToken");
  if (!e)
    return null;
  const { sub: n } = e;
  return n ? {
    id: e.sub,
    givenName: e.given_name,
    familyName: e.family_name,
    email: e.email,
    picture: e.picture
  } : (console.error("No sub in idToken"), null);
}, ge = async (e) => {
  const n = await I();
  if (!n)
    return {
      permissionKey: e,
      orgCode: null,
      isGranted: !1
    };
  const t = n.permissions || [];
  return {
    permissionKey: e,
    orgCode: n.org_code,
    isGranted: !!t.includes(e)
  };
}, me = async () => {
  const e = await I();
  if (!e)
    return {
      orgCode: null,
      permissions: []
    };
  const n = e.permissions || [];
  return {
    orgCode: e.org_code,
    permissions: n
  };
}, he = async () => (await I("idToken"))?.org_codes || null, we = async () => {
  const e = await I();
  return e ? e.roles ? e.roles : (console.warn(
    "No roles found in token, ensure roles have been included in the token customisation within the application settings"
  ), []) : [];
}, K = {
  secure: null,
  insecure: null
}, q = (e) => {
  K.secure = e;
}, b = () => K.secure || null, H = () => K.secure || null, L = async ({
  domain: e,
  clientId: n,
  refreshType: t = 0
  /* refreshToken */
}) => {
  try {
    if (!e)
      return {
        success: !1,
        error: "Domain is required for token refresh"
      };
    if (!n)
      return {
        success: !1,
        error: "Client ID is required for token refresh"
      };
    let s = "", a;
    if (y.useInsecureForRefreshToken || !Z(e) ? a = H() : a = b(), t === 0) {
      if (!a)
        return {
          success: !1,
          error: "No active storage found"
        };
      if (s = await a.getSessionItem(
        c.refreshToken
      ), !s)
        return {
          success: !1,
          error: "No refresh token found"
        };
    }
    N();
    try {
      const g = await fetch(`${O(e)}/oauth2/token`, {
        method: "POST",
        ...t === 1 && { credentials: "include" },
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: new URLSearchParams({
          ...t === 0 && {
            refresh_token: s
          },
          grant_type: "refresh_token",
          client_id: n
        })
      });
      if (!g.ok)
        return {
          success: !1,
          error: "Failed to refresh token"
        };
      const d = await g.json();
      if (d.access_token) {
        const h = b();
        return h ? (j(d.expires_in, async () => {
          L({ domain: e, clientId: n, refreshType: t });
        }), a && (await h.setSessionItem(
          c.accessToken,
          d.access_token
        ), d.id_token && await h.setSessionItem(
          c.idToken,
          d.id_token
        ), d.refresh_token && await a.setSessionItem(
          c.refreshToken,
          d.refresh_token
        )), {
          success: !0,
          [c.accessToken]: d.access_token,
          [c.idToken]: d.id_token,
          [c.refreshToken]: d.refresh_token
        }) : {
          success: !1,
          error: "No active storage found"
        };
      }
    } catch (g) {
      return {
        success: !1,
        error: `No access token recieved: ${g}`
      };
    }
    return {
      success: !1,
      error: "No access token recieved"
    };
  } catch (s) {
    return {
      success: !1,
      error: `Error refreshing token: ${s.message}`
    };
  }
}, Z = (e) => !e.match(
  /^(?:https?:\/\/)?[a-zA-Z0-9][.-a-zA-Z0-9]*\.kinde\.com$/i
), k = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ExpoSecureStore: G,
  PromptTypes: x,
  StorageKeys: c,
  clearRefreshTimer: N,
  getActiveStorage: b,
  getClaim: F,
  getClaims: z,
  getCurrentOrganization: ue,
  getDecodedToken: I,
  getFlag: le,
  getInsecureStorage: H,
  getPermission: ge,
  getPermissions: me,
  getRoles: we,
  getUserOrganizations: he,
  getUserProfile: fe,
  isCustomDomain: Z,
  mapLoginMethodParamsForUrl: V,
  refreshToken: L,
  sanitizeUrl: O,
  setActiveStorage: q,
  setRefreshTimer: j,
  storageSettings: y
}, Symbol.toStringTag, { value: "Module" })), pe = "openid profile email offline";
function ke(e, n) {
  if (!e)
    return null;
  const t = e.split(".");
  if (t.length !== 3)
    return null;
  const s = t[
    1
    /* body */
  ].replace(/-/g, "+").replace(/_/g, "/"), a = decodeURIComponent(
    atob(s).split("").map((g) => "%" + ("00" + g.charCodeAt(0).toString(16)).slice(-2)).join("")
  );
  return JSON.parse(a);
}
var ye = typeof globalThis < "u" ? globalThis : typeof window < "u" || typeof window < "u" ? window : typeof self < "u" ? self : {}, E = { exports: {} };
/*! https://mths.be/base64 v1.0.0 by @mathias | MIT license */
E.exports;
(function(e, n) {
  (function(t) {
    var s = n, a = e && e.exports == s && e, g = typeof window == "object" && window;
    (g.global === g || g.window === g) && (t = g);
    var d = function(i) {
      this.message = i;
    };
    d.prototype = new Error(), d.prototype.name = "InvalidCharacterError";
    var h = function(i) {
      throw new d(i);
    }, m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", P = /[\t\n\f\r ]/g, $ = function(i) {
      i = String(i).replace(P, "");
      var w = i.length;
      w % 4 == 0 && (i = i.replace(/==?$/, ""), w = i.length), (w % 4 == 1 || // http://whatwg.org/C#alphanumeric-ascii-characters
      /[^+a-zA-Z0-9/]/.test(i)) && h(
        "Invalid character: the string to be decoded is not correctly encoded."
      );
      for (var p = 0, r, o, u = "", l = -1; ++l < w; )
        o = m.indexOf(i.charAt(l)), r = p % 4 ? r * 64 + o : o, p++ % 4 && (u += String.fromCharCode(
          255 & r >> (-2 * p & 6)
        ));
      return u;
    }, R = function(i) {
      i = String(i), /[^\0-\xFF]/.test(i) && h(
        "The string to be encoded contains characters outside of the Latin1 range."
      );
      for (var w = i.length % 3, p = "", r = -1, o, u, l, f, _ = i.length - w; ++r < _; )
        o = i.charCodeAt(r) << 16, u = i.charCodeAt(++r) << 8, l = i.charCodeAt(++r), f = o + u + l, p += m.charAt(f >> 18 & 63) + m.charAt(f >> 12 & 63) + m.charAt(f >> 6 & 63) + m.charAt(f & 63);
      return w == 2 ? (o = i.charCodeAt(r) << 8, u = i.charCodeAt(++r), f = o + u, p += m.charAt(f >> 10) + m.charAt(f >> 4 & 63) + m.charAt(f << 2 & 63) + "=") : w == 1 && (f = i.charCodeAt(r), p += m.charAt(f >> 2) + m.charAt(f << 4 & 63) + "=="), p;
    }, S = {
      encode: R,
      decode: $,
      version: "1.0.0"
    };
    if (s && !s.nodeType)
      if (a)
        a.exports = S;
      else
        for (var A in S)
          S.hasOwnProperty(A) && (s[A] = S[A]);
    else
      t.base64 = S;
  })(ye);
})(E, E.exports);
var M = E.exports;
const J = ne(
  void 0
);
typeof window < "u" && (window.btoa = M.encode, window.atob = M.decode);
const T = new G();
q(T);
const Ce = ({
  children: e,
  config: n
}) => {
  const t = n.domain;
  if (t === void 0)
    throw new Error("KindeAuthProvider config.domain prop is undefined");
  const s = n.clientId;
  if (s === void 0)
    throw new Error("KindeAuthProvider config.clientId prop is undefined");
  const a = n.scopes?.split(" ") || pe.split(" "), [g, d] = re(!1), h = X({ native: ie.isDevice }), m = {
    authorizationEndpoint: `${t}/oauth2/auth`,
    tokenEndpoint: `${t}/oauth2/token`,
    endSessionEndpoint: `${t}/logout`,
    userInfoEndpoint: `${t}/oauth2/v2/user_profile`,
    revocationEndpoint: `${t}/oauth2/revoke`
  };
  oe(() => {
    (async () => {
      await A() && d(!0);
    })();
  }, []);
  const P = async (r = {}) => {
    if (!h)
      return {
        success: !1,
        errorMessage: "This library only works on a mobile device"
      };
    const o = new Y({
      clientId: s,
      redirectUri: h,
      scopes: a,
      extraParams: {
        ...V(r),
        has_success_page: "true"
      }
    });
    try {
      const u = await o.promptAsync(
        {
          authorizationEndpoint: `${t}/oauth2/auth`
        },
        {
          showInRecents: !0
        }
      );
      if (o && u?.type === "success") {
        const l = await ee(
          {
            clientId: s,
            code: u.params.code,
            extraParams: o.codeVerifier ? { code_verifier: o.codeVerifier } : void 0,
            redirectUri: h
          },
          { tokenEndpoint: `${t}/oauth2/token` }
        );
        if (l.idToken) {
          const _ = await D({
            token: l.idToken,
            domain: t
          });
          _.valid ? T.setSessionItem(
            c.idToken,
            l.idToken
          ) : console.error("Invalid id token", _.message);
        }
        const f = await D({
          token: l.accessToken,
          domain: t
        });
        return f.valid ? (T.setSessionItem(
          c.accessToken,
          l.accessToken
        ), d(!0)) : console.error(
          "Invalid access token",
          f.message
        ), T.setSessionItem(
          c.refreshToken,
          l.refreshToken
        ), j(l.expiresIn || 60, async () => {
          L({ domain: t, clientId: s });
        }), {
          success: !0,
          accessToken: l.accessToken,
          idToken: l.idToken
        };
      }
      return {
        success: !1,
        errorMessage: "Unknown error"
      };
    } catch (u) {
      return console.error(u), { success: !1, errorMessage: u.message };
    }
  }, $ = async (r = {}) => P({ ...r, prompt: x.login }), R = async (r = {}) => P({ ...r, prompt: x.create });
  async function S({
    revokeToken: r
  } = {}) {
    const o = async () => {
      await T.removeItems(c.accessToken, c.idToken), d(!1);
    };
    return new Promise(async (u) => {
      const l = await T.getSessionItem(
        c.accessToken
      );
      l && m && (r ? Q(
        { token: l, tokenTypeHint: W.AccessToken },
        m
      ).then(async () => {
        await o(), u({ success: !0 });
      }).catch((f) => {
        console.error(f), u({ success: !1 });
      }) : (await te(
        `${m?.endSessionEndpoint}?redirect=${h}`
      ), await o(), u({ success: !0 }))), u({ success: !0 });
    });
  }
  async function A() {
    return await T.getSessionItem(c.accessToken);
  }
  async function i() {
    return await T.getSessionItem(c.idToken);
  }
  async function w(r = "accessToken") {
    const o = r === "accessToken" ? await A() : await i();
    return o ? ke(o) : null;
  }
  const p = {
    login: $,
    logout: S,
    register: R,
    getAccessToken: A,
    getIdToken: i,
    getDecodedToken: w,
    /**
     *
     * @param keyName key to get from the token
     * @returns { Promise<string | number | string[] | null> }
     */
    getClaim: async (...r) => {
      const { getClaim: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    // /**
    //  * get all claims from the token
    //  * @returns { Promise<T | null> }
    //  */
    getClaims: async (...r) => {
      const { getClaims: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    getCurrentOrganization: async (...r) => {
      const { getCurrentOrganization: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    getFlag: async (...r) => {
      const { getFlag: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    getUserProfile: async (...r) => {
      const { getUserProfile: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    /**
     *
     * @param permissionKey gets the value of a permission
     * @returns { PermissionAccess }
     */
    getPermission: async (...r) => {
      const { getPermission: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    /**
     * Get all permissions
     * @returns { Promise<Permissions> }
     */
    getPermissions: async (...r) => {
      const { getPermissions: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    getUserOrganizations: async (...r) => {
      const { getUserOrganizations: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    getRoles: async (...r) => {
      const { getRoles: o } = await Promise.resolve().then(() => k);
      return o(...r);
    },
    // refreshToken: async (...args: Parameters<typeof refreshToken>) => {
    //   const { refreshToken } = await import("@kinde/js-utils");
    //   return refreshToken(...args);
    // },
    isAuthenticated: g
  };
  return /* @__PURE__ */ B(J.Provider, { value: p, children: e });
}, ve = () => {
  const e = se(J);
  if (!e)
    throw new Error("useKindeAuth must be used within a KindeAuthProvider");
  return e;
}, xe = () => ve();
export {
  J as KindeAuthContext,
  Ce as KindeAuthProvider,
  xe as useKindeAuth,
  ve as useKindeAuthContext
};
