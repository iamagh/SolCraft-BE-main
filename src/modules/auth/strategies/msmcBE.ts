
var FETCH, http;
try { FETCH = typeof fetch == 'function' ? fetch : require("node-fetch"); } catch (er) { console.log(er); console.warn("[MSMC]: Could not load fetch, please use setFetch to define it manually!"); }
try { http = require("http"); } catch (er) { console.warn("[MSMC]: Some sign in methods may not work due to missing http server support in enviroment"); }
//This needs to be apart or we could end up with a memory leak!
var app;

var https = require("https")
import axios from "axios";

const xboxProfile = async (XBLToken, updates = (param: any) => { }) => {
    const lbar = 100 / 2.5;
    updates({ type: "Loading", data: "Getting xuid", percent: 0 });
    var rxsts = await FETCH("https://xsts.auth.xboxlive.com/xsts/authorize", {
        method: "post",
        body: JSON.stringify({
            Properties: { SandboxId: "RETAIL", UserTokens: [XBLToken] },
            RelyingParty: "http://xboxlive.com",
            TokenType: "JWT",
        }),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await rxsts.json();
    const xui = json.DisplayClaims.xui[0];
    updates({ type: "Loading", data: "Getting profile info", percent: lbar * 1 });
    var info = await FETCH("https://profile.xboxlive.com/users/batch/profile/settings",
        {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "x-xbl-contract-version": 2,
                Authorization: "XBL3.0 x=" + xui.uhs + ";" + json.Token,
            },
            body: JSON.stringify({ "userIds": [xui.xid], "settings": ["GameDisplayName", "GameDisplayPicRaw", "Gamerscore"] }),
        });
    updates({ type: "Loading", data: "Parsing profile info", percent: lbar * 2 });
    // console.log(info);
    const profile = await info.json();
    // console.log(profile);
    const settings = profile.profileUsers[0].settings;
    updates({ type: "Loading", data: "Done!", percent: 100 });
    return {
        xuid: xui.xid,
        gamerTag: xui.gtg,
        name: settings.find(s => s.id == "GameDisplayName").value,
        profilePictureURL: settings.find(s => s.id == "GameDisplayPicRaw").value,
        score: settings.find(s => s.id == "Gamerscore").value,
        getAuth: () => "XBL3.0 x=" + xui.uhs + ";" + json.Token
    }
}

const setCallback = (callback) => {
    if (!http) { console.error("[MSMC]: Could not define http server, please use a different method!"); return; }
    try { if (app) { app.close(); } } catch { /*Ignore*/ }
    app = http.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Thank you!");
        app.close();

        if (req.url.includes("?")) {
            const urlParams = new URLSearchParams(req.url.substr(req.url.indexOf("?") + 1));
            callback(urlParams);
        }
    });
    return app.listen();
}

const setFetch = (fetchIn) => {
    FETCH = fetchIn;
}

const getFetch = () => {
    return FETCH;
}

const errorCheck = () => {
    if (typeof FETCH !== "function") {
        console.error("[MSMC]: The version of fetch provided is not a function!");
        return true;
    }

    return false;
}

const get = async (body, updates = console.log) => {
    const percent = 100 / 5;
    // if (self.errorCheck()) { return Promise.reject("[MSMC]: Error : no or invalid version of fetch available!"); }
    updates({ type: "Starting" });

    //console.log(Params); //debug
    function loadBar(number, asset) {
        updates({ type: "Loading", data: asset, percent: number });
    }

    function error(reason, translationString, data) {
        return { type: "Authentication", reason: reason, data: data, translationString: translationString }
    }

    function webCheck(response) {
        return (response.status >= 400)
    }

    loadBar(percent * 0, "Getting Login Token");

    const response = await axios.post("https://login.live.com/oauth20_token.srf", body, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    var MS = response.data

    // if (webCheck(MS_Raw)) return error("Could not log into Microsoft", "Login.Fail.MS", rxboxlive);
    // var MS = await MS_Raw.json();

    //console.log(MS); //debug
    if (MS.error) {
        return error("(" + MS.error + ") => " + MS.error_description + "\nThis is likely due to an invalid refresh token. Please relog!", "Login.Fail.Relog", { error: MS.error, disc: MS.error_description });
    }

    loadBar(percent * 1, "Logging into Xbox Live");
    var rxboxlive = await axios.post("https://user.auth.xboxlive.com/user/authenticate", {
        body: JSON.stringify({
            Properties: {
                AuthMethod: "RPS",
                SiteName: "user.auth.xboxlive.com",
                RpsTicket: "d=" + MS.access_token // your access token from step 2 here
            },
            RelyingParty: "http://auth.xboxlive.com",
            TokenType: "JWT"
        }),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    var token = rxboxlive.data;
    //console.log(token); //debug
    var XBLToken = token.Token;
    var UserHash = token.DisplayClaims.xui[0].uhs;
    loadBar(percent * 2, "Getting a Xbox One Security Token");
    var rxsts = await FETCH("https://xsts.auth.xboxlive.com/xsts/authorize", {
        method: "post",
        body: JSON.stringify({
            Properties: { SandboxId: "RETAIL", UserTokens: [XBLToken] },
            RelyingParty: "rp://api.minecraftservices.com/",
            TokenType: "JWT",
        }),
        //"rp://api.minecraftservices.com/",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
    });


    var XSTS = await rxsts.json();

    loadBar(percent * 2.5, "Checking for errors");
    //console.log(XSTS); //debug
    if (XSTS.XErr) {
        var reason = "Unknown reason";
        var ts = "Unknown";
        switch (XSTS.XErr) {
            case 2148916233: {
                reason = "The account doesn't have an Xbox account.";
                ts = "UserNotFound";
                break;
            };
            case 2148916238: {
                //Check MSMC's wiki pages on github if you keep getting this error
                reason =
                    "The account is a child (under 18) and cannot proceed unless the account is added to a Family by an adult.";
                ts = "UserNotAdult";
                break;
            }
        }
        return console.log(reason, "Account." + ts);
    }
    //console.log("XBL3.0 x=" + UserHash + ";" + XSTS.Token) //debug
    loadBar(percent * 3, "Logging into Minecraft");
    var rlogin_with_xbox = await FETCH(
        "https://api.minecraftservices.com/authentication/login_with_xbox",
        {
            method: "post",
            body: JSON.stringify({
                identityToken: "XBL3.0 x=" + UserHash + ";" + XSTS.Token
            }),
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        }
    );
    if (webCheck(rlogin_with_xbox)) return error("Could not log into Minecraft", "Login.Fail.MC", rlogin_with_xbox);

    var MCauth = await rlogin_with_xbox.json();
    //console.log(MCauth) //debug
    const experationDate = Math.floor(Date.now() / 1000) + MCauth["expires_in"] - 100

    loadBar(percent * 4, "Fetching player profile");
    var r998 = await FETCH("https://api.minecraftservices.com/minecraft/profile", {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + MCauth.access_token,
        },
    });

    loadBar(percent * 4.5, "Extracting XUID and parsing player object");
    var profile = await r998.json();
    const xuid = parseJwt(MCauth.access_token).xuid;
    profile._msmc = { refresh: MS.refresh_token, expires_by: experationDate, mcToken: MCauth.access_token };
    if (profile.error) {
        profile._msmc.demo = true;
        return ({ type: "DemoUser", access_token: MCauth.access_token, profile: { xuid: xuid, _msmc: profile._msmc, id: MCauth.username, name: 'Player' }, translationString: "Login.Success.DemoUser", reason: "User does not own minecraft", getXbox: () => xboxProfile(XBLToken) });
    }
    profile.xuid = xuid;
    loadBar(100, "Done!");
    return ({ type: "Success", access_token: MCauth.access_token, profile: profile, getXbox: (updates) => xboxProfile(XBLToken, updates), translationString: "Login.Success.User" });
}

const parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(Buffer.from(base64, "base64").toString("utf8").split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

export default {
    //Used for the old/generic method of authentication
    setCallback,
    //Used to set the version of fetch used manually
    setFetch,
    //Used internally to get fetch when needed

    getFetch,
    //Load constants 
    errorCheck,
    //Used to get xbox profile information
    xboxProfile,

    //Main Login flow implementation
    get,
    
    parseJwt
}



// const self = module.exports;