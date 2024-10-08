
function getRelays() {
    relays = localStorage.getItem('relays') ?
        localStorage.getItem('relays').split(',') : [];
    if (relays.length === 0) {
        relays = ['wss://damus.io', 'wss://primal.net', 'wss://nos.lol'];
        localStorage.setItem('relays', relays.join(','));
    }
    console.log('Relays:', relays);
    return relays;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('setrelays').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        fetch('/relay.html') // Adjust the path if necessary
            .then(response => response.text())
            .then(html => {
                document.getElementById('main-container').innerHTML = html;
                let relays = getRelays();
                console.log('Relays:', relays);
                updateDisplay();
                console.log(" clicked on set relays")
            })
            .catch(error => {
                console.error('Error loading relay.html:', error);
            });
    });
});

function updateDisplay() {
    const list = document.getElementById('relayList');
    list.innerHTML = '';
    relays.forEach((relay, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" id="relay${index}">
            <label for="relay${index}">${relay}</label>
        `;
        list.appendChild(li);
    });
    // Update localStorage
    localStorage.setItem('relays', relays.join(','));
}

function addRelay() {
    const input = document.getElementById('relayInput');
    const newRelay = input.value.trim();

    if (newRelay && !relays.includes(newRelay)) {
        relays.push(newRelay);
        input.value = '';
        updateDisplay();
    }
}

function deleteSelected() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const toDelete = Array.from(checkboxes)
        .map((checkbox, index) => checkbox.checked ? index : -1)
        .filter(index => index !== -1)
        .sort((a, b) => b - a);

    toDelete.forEach(index => {
        relays.splice(index, 1);
    });

    updateDisplay();
}

// Initialize display
updateDisplay();

// Add event listener for Enter key
document.getElementById('relayInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addRelay();
    }
});
