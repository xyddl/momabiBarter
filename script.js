let data = [];
let regionInfo = [];
let uniqueNames = [];

function cleanName(name) {
    return name.replace(/\s*x\d+$/, '').trim();
}

function getRegionPath(npcName) {
    for (const region of regionInfo) {
        if (region.NPC.includes(npcName)) {
            return `${region.대륙} > ${region.도시} > <span class="npc-highlight">${npcName}</span>`;
        }
    }
    return `<span class="npc-highlight">${npcName}</span>`;
}

function escapeRegexChar(char) {
    return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
    const chars = query.replace(/\s+/g, '').split('');
    const escapedChars = chars.map(escapeRegexChar);
    const pattern = escapedChars.join('\\s*');
    try {
        const regex = new RegExp(pattern, 'gi');
        return text.replace(regex, match => `<mark>${match}</mark>`);
    } catch (e) {
        return text;
    }
}

function populateAutocomplete(query) {
    const list = document.getElementById("autocompleteList");
    list.innerHTML = "";

    if (!query) return;

    const matches = uniqueNames.filter(name =>
        name.toLowerCase().includes(query.toLowerCase())
    );

    matches.slice(0, 10).forEach(name => {
        const li = document.createElement("li");
        li.className = "autocomplete-item";
        li.textContent = name;
        li.onclick = () => {
            document.getElementById("searchInput").value = name;
            list.innerHTML = "";
            searchResults(name);
        };
        list.appendChild(li);
    });
}

function searchResults(query) {
    const cleanQuery = query.replace(/\s+/g, "").toLowerCase();
    const leftResults = document.getElementById("leftResults");
    const rightResults = document.getElementById("rightResults");

    leftResults.innerHTML = `<div class="section-title">🧠 ${query} 드릴게요</div>`;
    rightResults.innerHTML = `<div class="section-title">🙋 ${query} 주세요</div>`;

    let found = false;

    data.forEach(entry => {
        const itemName = cleanName(entry["아이템명"]);
        const needItem = cleanName(entry["필요 아이템"]);
        const itemNameClean = itemName.replace(/\s+/g, "").toLowerCase();
        const needItemClean = needItem.replace(/\s+/g, "").toLowerCase();

        if (itemNameClean.includes(cleanQuery) || needItemClean.includes(cleanQuery)) {
            found = true;
            const regionPath = getRegionPath(entry["NPC"]);
            const card = `
        <div class="result-card">
          <h5>${highlightText(entry["아이템명"], query)}</h5>
          <p>필요 아이템: ${highlightText(entry["필요 아이템"], query)}</p>
          <p>구매 제한: ${entry["구매 제한"]}</p>
          <p class="mt-2">${regionPath}</p>
          <span class="hashtag">#물물교환</span>
        </div>
      `;
            if (itemNameClean.includes(cleanQuery)) {
                rightResults.innerHTML += card;
            } else {
                leftResults.innerHTML += card;
            }
        }
    });

    if (!found) {
        leftResults.innerHTML += '<div class="text-muted">관련된 결과가 없습니다.</div>';
        rightResults.innerHTML += '<div class="text-muted">관련된 결과가 없습니다.</div>';
    }
}

document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const query = document.getElementById("searchInput").value.trim();
    if (query !== "") {
        searchResults(query);
        document.getElementById("autocompleteList").innerHTML = "";
    }
});

document.getElementById("searchInput").addEventListener("input", function () {
    populateAutocomplete(this.value.trim());
});

document.addEventListener("click", function (e) {
    if (!document.querySelector(".search-box").contains(e.target)) {
        document.getElementById("autocompleteList").innerHTML = "";
    }
});

Promise.all([
    fetch("data.json").then(res => res.json()),
    fetch("대륙.json").then(res => res.json())
])
    .then(([dataJson, regionJson]) => {
        data = dataJson;
        regionInfo = regionJson;

        const nameSet = new Set();
        data.forEach(entry => {
            nameSet.add(cleanName(entry["아이템명"]));
            nameSet.add(cleanName(entry["필요 아이템"]));
        });
        uniqueNames = Array.from(nameSet);
    })
    .catch(error => {
        console.error("데이터 로딩 실패:", error);
    });
