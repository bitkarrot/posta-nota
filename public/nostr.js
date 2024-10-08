var loggedIn;

let pubkey = "";
// Access the functions from the global object
const { relayInit, generateSecretKey, getPublicKey, SimplePool} = NostrTools;
const nip19 = NostrTools.nip19;

checkLoginStatus();
displayUserInfo();

function checkLoginStatus() {
    const userInfo = JSON.parse(localStorage.getItem('__nostrlogin_accounts'));
    if (userInfo && userInfo.length > 0) {
        loggedIn = true
    } else{
        loggedIn = false
    }
}

// At the top of your JavaScript file, add:
function updateButtonVisibility() {
  const loginButton = document.getElementById('signupButton');
  const logoutButton = document.getElementById('logoutButton');
  const setRelays = document.getElementById('setrelays');
  const landing = document.getElementById('landing');
  const mainContainer = document.getElementById('main-container');

  if (loggedIn) {
      loginButton.style.display = 'none';
      setRelays.style.display = 'block';
      logoutButton.style.display = 'block';
      landing.style.display = 'none';
      mainContainer.style.display = 'block';

  } else {
      loginButton.style.display = 'block';
      setRelays.style.display = 'none';
      logoutButton.style.display = 'none';
      landing.style.display = 'block';
      mainContainer.style.display = 'none';
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

                // get npub to use with link to nostr
                pubkey = user.pubkey
                let npub = nip19.npubEncode(user.pubkey)
                var npubElement = document.getElementById('npub');
                npubElement.innerHTML = "Hello, <a href='https://njump.me/" + npub + "'>" + user.name + "</a>";

                // set avatar
                const avatarElement = document.getElementById('avatar');
                avatarElement.src = user.picture;
                avatarElement.style.display = 'block';

            } else {
                console.log("No user info available (empty array)");
            }
        } catch (error) {
            console.log("Error parsing userInfo:", error);
        }
    }, 200); // Delay to ensure data is loaded
}

function clearUserInfo() { 
    loggedIn = false;
    document.getElementById('npub').innerHTML = '';
    document.getElementById('avatar').style.display = 'none';
    document.getElementById('setrelays').style.display = 'none';
    updateButtonVisibility(); // login/logout button visibility
}

async function sendEvent(textNote, publicKey, defaultRelays) {
    try {
        let hiveRelays = ['wss://hivetalk.nostr1.com'];
        let allrelays = [...hiveRelays, ...defaultRelays];
        console.log('send Event - Relays:', allrelays);
        // Create an event
        const event = {
            kind: 1,
            pubkey: publicKey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: textNote + '\n\n\n via #PostaNota',
        };
        console.log('Kind 1 - Event created', event);

        // Request the nos2x extension to sign the event
        const signedEvent = await window.nostr.signEvent(event);
        console.log('Signed Event:', signedEvent);

        const eventID = signedEvent['id'];
        console.log('Event ID', eventID);

        console.log("all relays", allrelays);

        const pool = new window.NostrTools.SimplePool();
        await Promise.any(pool.publish(allrelays, signedEvent));
        console.log('Published to at least one relay!');

        const h = pool.subscribeMany(
            [...allrelays],
            [
                {
                    authors: [publicKey],
                },
            ],
            {
                onevent(event) {
                    if (event.id === eventID) {
                        console.log('Event received:', event);
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Note Sent',
                            html: `<p>Sent to Nostr successfully!</p> <p>Note: <a href="https://snort.social/e/${eventID}" target="_blank">${eventID}</a></p>`,
                        });
                    }
                },
                oneose() {
                    h.close();
                },
            },
        );
    } catch (error) {
        console.error('An error occurred:', error);
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong posting to Nostr! Try again?',
        });
    }
}

function handleButtonClick() {
    const content = document.getElementById('content').value;
    sendEvent(content, pubkey, relays);
}
