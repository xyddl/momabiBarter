let data = [];
let regionInfo = [];

// NPC 이름에 해당하는 위치 정보를 찾는 함수
function getRegionPath(npcName) {
    for (const region of regionInfo) {
        if (region.NPC.includes(npcName)) {
            return `${region.대륙} > ${region.도시} > <span class="npc-highlight">${npcName}</span>`;
        }
    }
    return `<span class="npc-highlight">${npcName}</span>`; // 못 찾으면 NPC 이름만 표시
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
        console.error('정규표현식 에러:', e);
        return text;
    }
}

function populateAutocomplete() {
    const uniqueItems = new Set();
    data.forEach(entry => {
        uniqueItems.add(entry["아이템명"]);
        uniqueItems.add(entry["필요 아이템"]);
    });

    const list = document.getElementById("autocompleteList");
    list.innerHTML = "";
    uniqueItems.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        list.appendChild(option);
    });
}

function searchResults(query) {
    const cleanQuery = query.replace(/\s+/g, "").toLowerCase();
    const leftResults = document.getElementById("leftResults");
    const rightResults = document.getElementById("rightResults");

    leftResults.innerHTML = '<div class="section-title">🧠 ' + query + ' 드릴게요</div>';
    rightResults.innerHTML = '<div class="section-title">🙋 ' + query + ' 주세요</div>';

    let found = false;

    data.forEach(entry => {
        const itemNameClean = entry["아이템명"].replace(/\s+/g, "").toLowerCase();
        const needItemClean = entry["필요 아이템"].replace(/\s+/g, "").toLowerCase();

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
    }
});

// JSON 2개 비동기 로드 후 실행
Promise.all([
    fetch("data.json").then(res => res.json()),
    fetch("대륙.json").then(res => res.json())
])
    .then(([dataJson, regionJson]) => {
        data = dataJson;
        regionInfo = regionJson;
        populateAutocomplete();
    })
    .catch(error => {
        console.error("데이터 로딩 실패:", error);
    });