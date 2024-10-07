var loggedIn = false

// Access the functions from the global object
const { generateSecretKey, getPublicKey } = NostrTools;
const nip19 = NostrTools.nip19;

// At the top of your JavaScript file, add:
function updateButtonVisibility() {
  const loginButton = document.getElementById('signupButton');
  const logoutButton = document.getElementById('logoutButton');
  
  if (loggedIn) {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
  } else {
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
    if (window.nostr) {

        function onSignupClick() {
            document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
        }
        document.getElementById('signupButton').addEventListener('click', onSignupClick);

        function onLogoutClick() {
            document.dispatchEvent(new Event("nlLogout"))
        }
        document.getElementById('logoutButton').addEventListener('click', onLogoutClick);
        updateButtonVisibility();

   } else {
        console.error('Nostr Login script is not loaded correctly.');
    }
});

/// methods 
document.addEventListener('nlAuth', (e) => {
    console.log("nlauth", e)
    if (e.detail.type === 'login' || e.detail.type === 'signup') {
        if (!loggedIn) {
            console.log("Logging In")
            loggedIn = true
            updateButtonVisibility(); // login/logout button visibility
            //onLogin();  // get pubkey with window.nostr and show user profile
            setTimeout(function() {
                loadUser();
            }, 200);
        }
    } else {
    // onLogout()  // clear local user data, hide profile info 
    if (loggedIn) {
        setTimeout(function() {
            console.log("logoff section")
            loggedIn = false
            clearUserInfo();
            document.dispatchEvent(new Event("nlLogout")); // logout from nostr-login
            updateButtonVisibility(); // login/logout button visibility
            // logOff()
        }, 200);
    }
    }
})

function loadUser() {
    if (window.nostr) {
        window.nostr.getPublicKey().then(function (pubkey) {
            if (pubkey) {
                loggedIn = true
                // npubkey = pubkey
                console.log("fetched pubkey", pubkey)
                displayUserInfo();        
                updateButtonVisibility(); // login/logout button visibility         
            } 
        }).catch((err) => {
            console.log("LoadUser Err", err);
            console.log("logoff section")
            loggedIn = false
            document.dispatchEvent(new Event("nlLogout")); // logout from nostr-login
            //logOff()
            updateButtonVisibility(); // login/logout button visibility
        });
    }
}


function displayUserInfo() {
    setTimeout(() => { // Adding a delay to ensure data is available
        // Assuming userInfo is stored in localStorage or accessible through the event
        const userInfo = JSON.parse(localStorage.getItem('__nostrlogin_accounts'));
        try {
            if (userInfo && userInfo.length > 0) {
                const user = userInfo[0];
                console.log("user from _nostrlogin_accounts: ", user);
                document.getElementById('username').innerHTML = "Username: " + user.name;
                const avatarElement = document.getElementById('avatar');
                avatarElement.src = user.picture;
                avatarElement.style.display = 'block';

                var pubkeyElement = document.getElementById('pubkey');
                pubkeyElement.innerHTML = "Getting Current pubkey..." + user.pubkey;

                // get npub to use with link to nostr
                let npub = nip19.npubEncode(user.pubkey)
                var npubElement = document.getElementById('npub');
                npubElement.innerHTML = "Current npub: <a href='https://njump.me/" + npub + "'>" + npub + "</a>";

            } else {
                console.log("No user info available (empty array)");
            }
        } catch (error) {
            console.log("Error parsing userInfo:", error);
        }
    }, 200); // Delay to ensure data is loaded
}

function clearUserInfo() { 
    // clear user info on logout
    document.getElementById('username').innerHTML = '';
    document.getElementById('npub').innerHTML = '';
    document.getElementById('pubkey').innerHTML = '';
    document.getElementById('avatar').style.display = 'none';
    loggedIn = false;
    updateButtonVisibility(); // login/logout button visibility
}
