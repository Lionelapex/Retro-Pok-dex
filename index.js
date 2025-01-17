// Global variables
let isShiny = false;
let currentPokemon = null;
let pokemon1Data = null;
let pokemon2Data = null;
let isSoundOn = true;
const pokemonCry = new Audio('./pokemon-intro-instr-ringtone-101soundboards.mp3'); // Update this path
pokemonCry.loop = true; // Make the sound loop continuously

// Main fetch function
async function fetchData() {
    try {
        showLoading();
        const pokemon = document.getElementById("pokemonname").value.toLowerCase();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

        if (!response.ok) {
            throw new Error("Pokemon not found!");
        }

        const data = await response.json();
        currentPokemon = data;
        
        // Remove existing compare buttons if they exist
        const existingButtons = document.querySelector('.compare-buttons');
        if (existingButtons) {
            existingButtons.remove();
        }
        
        // Add new compare buttons
        const compareButtons = `
            <div class="compare-buttons">
                <button class="retro-button" onclick="comparePokemon(${data.id}, 1)">Compare as #1</button>
                <button class="retro-button" onclick="comparePokemon(${data.id}, 2)">Compare as #2</button>
            </div>
        `;
        
        document.querySelector('.pokemon-card').insertAdjacentHTML('beforeend', compareButtons);
        
        updatePokemonDisplay(data);
        addToHistory(data.name);
        await fetchEvolutionChain(data.id);
        calculateTypeEffectiveness(data.types);
        hideLoading();
    } catch (error) {
        hideLoading();
        alert(error.message);
        console.error(error);
    }
}

// Update Pokemon display
function updatePokemonDisplay(data) {
    // Basic info
    const pokemonImage = document.getElementById("pokemonImage");
    const pokemonName = document.getElementById("pokemonName");
    
    pokemonImage.src = isShiny ? data.sprites.front_shiny : data.sprites.front_default;
    pokemonImage.alt = data.name;
    pokemonName.textContent = `#${String(data.id).padStart(3, '0')} ${data.name}`;
    
    // Display types
    displayTypes(data.types);
    
    // Display stats
    displayStats(data.stats);
    
    // Display moves
    displayMoves(data.moves);
    
    // Update favorite button
    updateFavoriteButton(data.id);
}

// Display types
function displayTypes(types) {
    const typeContainer = document.querySelector('.type-tags');
    typeContainer.innerHTML = '';
    types.forEach(type => {
        const typeTag = document.createElement('span');
        typeTag.className = `type-tag ${type.type.name}`;
        typeTag.textContent = type.type.name;
        typeContainer.appendChild(typeTag);
    });
}

// Display stats
function displayStats(stats) {
    const statsContainer = document.querySelector('.pokemon-stats');
    statsContainer.innerHTML = '';
    
    stats.forEach(stat => {
        const statBar = document.createElement('div');
        statBar.className = 'stat-bar';
        
        const statLabel = document.createElement('span');
        statLabel.className = 'stat-label';
        statLabel.textContent = stat.stat.name;
        
        const statProgress = document.createElement('div');
        statProgress.className = 'stat-progress';
        
        const statFill = document.createElement('div');
        statFill.className = 'stat-fill';
        statFill.style.width = `${(stat.base_stat / 255) * 100}%`;
        
        statProgress.appendChild(statFill);
        statBar.appendChild(statLabel);
        statBar.appendChild(statProgress);
        statsContainer.appendChild(statBar);
    });
}

// Display moves
function displayMoves(moves) {
    const movesList = document.getElementById('movesList');
    movesList.innerHTML = '';
    
    moves.slice(0, 4).forEach(move => {
        const moveElement = document.createElement('div');
        moveElement.className = 'move-item';
        moveElement.textContent = move.move.name.replace('-', ' ');
        movesList.appendChild(moveElement);
    });
}

// Random Pokemon
async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 151) + 1;
    document.getElementById("pokemonname").value = randomId;
    await fetchData();
}

// Evolution chain
async function fetchEvolutionChain(pokemonId) {
    try {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const speciesData = await speciesResponse.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        
        displayEvolutionChain(evolutionData.chain);
    } catch (error) {
        console.error("Error fetching evolution chain:", error);
    }
}

// Display evolution chain
function displayEvolutionChain(chain) {
    const evoContainer = document.createElement('div');
    evoContainer.className = 'evolution-chain';
    // Implementation for displaying evolution chain
    // This would need additional HTML/CSS to display properly
}

// Search history
function addToHistory(pokemon) {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!history.includes(pokemon)) {
        history.unshift(pokemon);
        if (history.length > 5) history.pop();
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
    displayHistory();
}

// Display history
function displayHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const historyContainer = document.createElement('div');
    historyContainer.className = 'search-history';
    // Implementation for displaying search history
}

// Toggle shiny
function toggleShiny() {
    isShiny = !isShiny;
    
    // Update main Pokemon card if it exists
    if (currentPokemon) {
        const mainImage = document.getElementById("pokemonImage");
        mainImage.src = isShiny ? currentPokemon.sprites.front_shiny : currentPokemon.sprites.front_default;
    }
    
    // Update comparison Pokemon if they exist
    if (pokemon1Data) {
        const pokemon1Image = document.querySelector('#pokemon1 .pokemon-image');
        pokemon1Image.src = isShiny ? pokemon1Data.sprites.front_shiny : pokemon1Data.sprites.front_default;
    }
    
    if (pokemon2Data) {
        const pokemon2Image = document.querySelector('#pokemon2 .pokemon-image');
        pokemon2Image.src = isShiny ? pokemon2Data.sprites.front_shiny : pokemon2Data.sprites.front_default;
    }
    
    // Update button text
    const shinyButton = document.querySelector('.shiny-toggle');
    shinyButton.classList.toggle('active');
    shinyButton.textContent = isShiny ? 'Normal Color' : 'Shiny Color';
}

// Favorites
function toggleFavorite(pokemonId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(pokemonId);
    if (index === -1) {
        favorites.push(pokemonId);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton(pokemonId);
}

// Update favorite button
function updateFavoriteButton(pokemonId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteButton = document.querySelector('.favorite-btn');
    if (favoriteButton) {
        favoriteButton.classList.toggle('active', favorites.includes(pokemonId));
    }
}

// Loading state
function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    document.querySelector('.pokemon-card').appendChild(loadingElement);
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Type effectiveness calculator
function calculateTypeEffectiveness(types) {
    // Implementation for type effectiveness calculation
    // This would need a type chart data structure and calculation logic
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start playing background music
    playBackgroundMusic();
    
    // Add enter key support for search
    document.getElementById('pokemonname').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchData();
        }
    });
    
    // Display search history on load
    displayHistory();
});

// Add this new function to handle VS comparison
async function comparePokemon(pokemonId, slot) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!response.ok) throw new Error("Pokemon not found!");
        
        const data = await response.json();
        
        if (slot === 1) {
            pokemon1Data = data;
        } else {
            pokemon2Data = data;
        }
        
        displayComparedPokemon(data, slot);
        
        if (pokemon1Data && pokemon2Data) {
            showComparison();
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// Function to display Pokemon in comparison slots
function displayComparedPokemon(data, slot) {
    const container = document.getElementById(`pokemon${slot}`);
    container.innerHTML = `
        <div class="pokemon-image-container">
            <img src="${data.sprites.front_default}" alt="${data.name}" class="pokemon-image">
        </div>
        <div class="pokemon-info">
            <h2 class="pokemon-name">#${String(data.id).padStart(3, '0')} ${data.name}</h2>
            <div class="type-tags">
                ${data.types.map(type => `
                    <span class="type-tag ${type.type.name}">${type.type.name}</span>
                `).join('')}
            </div>
        </div>
        <div class="pokemon-stats">
            ${data.stats.map(stat => `
                <div class="stat-bar">
                    <span class="stat-label">${stat.stat.name} (${stat.base_stat})</span>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: ${(stat.base_stat / 255) * 100}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="moves-list">
            <h3>Moves</h3>
            <div class="moves-grid">
                ${data.moves.slice(0, 4).map(move => `
                    <div class="move-item">${move.move.name.replace('-', ' ')}</div>
                `).join('')}
            </div>
        </div>
    `;
}

// Function to show comparison between Pokemon
function showComparison() {
    const vsBadge = document.querySelector('.vs-badge');
    vsBadge.style.opacity = '1';
    
    // Compare stats and highlight higher values
    pokemon1Data.stats.forEach((stat, index) => {
        // Get both stat elements
        const stat1Element = document.querySelector(`#pokemon1 .pokemon-stats .stat-bar:nth-child(${index + 1}) .stat-fill`);
        const stat2Element = document.querySelector(`#pokemon2 .pokemon-stats .stat-bar:nth-child(${index + 1}) .stat-fill`);
        
        // Get stat values
        const stat1Value = stat.base_stat;
        const stat2Value = pokemon2Data.stats[index].base_stat;
        
        // Reset previous styling
        stat1Element.style.backgroundColor = '';
        stat2Element.style.backgroundColor = '';
        stat1Element.classList.remove('winner');
        stat2Element.classList.remove('winner');
        
        // Compare and highlight
        if (stat1Value > stat2Value) {
            stat1Element.style.backgroundColor = '#4CAF50';
            stat1Element.classList.add('winner');
        } else if (stat2Value > stat1Value) {
            stat2Element.style.backgroundColor = '#4CAF50';
            stat2Element.classList.add('winner');
        } else {
            // If stats are equal, style both
            stat1Element.style.backgroundColor = '#FFA726';
            stat2Element.style.backgroundColor = '#FFA726';
        }
        
        // Update stat values to be visible
        const stat1Label = document.querySelector(`#pokemon1 .pokemon-stats .stat-bar:nth-child(${index + 1}) .stat-label`);
        const stat2Label = document.querySelector(`#pokemon2 .pokemon-stats .stat-bar:nth-child(${index + 1}) .stat-label`);
        
        stat1Label.textContent = `${stat.stat.name} (${stat1Value})`;
        stat2Label.textContent = `${pokemon2Data.stats[index].stat.name} (${stat2Value})`;
    });
}

// Add this function to handle sound toggle
function toggleSound() {
    isSoundOn = !isSoundOn;
    const soundButton = document.querySelector('.sound-toggle');
    soundButton.classList.toggle('active');
    soundButton.innerHTML = isSoundOn ? '🔊' : '🔇';
    
    if (isSoundOn) {
        pokemonCry.play();
    } else {
        pokemonCry.pause();
    }
}

// Add this function to play sound
function playPokemonCry(pokemonId) {
    if (!isSoundOn) return;
    
    pokemonCry.src = `/pokemon-intro-instr-ringtone-101soundboards.mp3`; // Update this path
    pokemonCry.play().catch(error => console.log("Sound play failed:", error));
}

// Add this function to handle background music
function playBackgroundMusic() {
    pokemonCry.play().catch(error => {
        console.log("Auto-play failed:", error);
        // Many browsers require user interaction before playing audio
        // We'll add a visual prompt if auto-play fails
        showPlayPrompt();
    });
}

// Add this function to show a play prompt if auto-play fails
function showPlayPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'play-prompt';
    prompt.innerHTML = `
        <button class="retro-button">
            🎵 Click to Play Music
        </button>
    `;
    document.body.appendChild(prompt);
    
    prompt.addEventListener('click', () => {
        pokemonCry.play();
        prompt.remove();
    });
}
