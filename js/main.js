var scoringSystemInput = document.getElementById('scoringSystem');
var scoringSystemSelect = document.getElementById('scoringSystemSelect');
var participantsContainer = document.getElementById('participantsContainer');
var judgesContainer = document.getElementById('judgesContainer');
var resultsContainer = document.getElementById('resultsContainer');
var winnersContainer = document.getElementById('winnersContainer');

var participantsNames = [];
var judgesNames = [];
var participantsData = [];

function createFields(container, count, labelPrefix, inputNamePrefix, namesArray) {
    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        let label = document.createElement('label');
        label.textContent = labelPrefix + i + ': ';

        let input = document.createElement('input');
        input.type = 'text';

        input.className = 'main__input'; // added Yantowsky
        input.name = inputNamePrefix + i;
        input.addEventListener('input', function (event) {
            namesArray[i - 1] = event.target.value;
        });

        container.appendChild(label);
        container.appendChild(input);
        container.appendChild(document.createElement('br'));
    }
}

function validateGrade(grade) {
    let maxGrade = parseInt(scoringSystemInput.value);
    return !isNaN(grade) && grade >= 0 && grade <= maxGrade;
}

function createParticipantAndJudgesFields() {
    let participantsCount = document.getElementById('participants').value;
    let judgesCount = document.getElementById('judgesCount').value;

    if (participantsCount <= 0 || judgesCount <= 0) {
        alert('Кількість учасників та суддів повинна бути більше 0.');
        return;
    }

    createFields(participantsContainer, participantsCount, 'Учасник ', 'participant', participantsNames);
    createFields(judgesContainer, judgesCount, 'Суддя ', 'judge', judgesNames);

    document.getElementById("btn_score").style.display = "block"; // added Yantowsky
    document.getElementById("resultsContainer").style.display = "none"; // added Yantowsky
    document.getElementById("btn_result").style.display = "none"; // added Yantowsky
    document.getElementById("winnersContainer").style.display = "none"; // added Yantowsky
    document.getElementById("winnersList").style.display = "none"; // added Yantowsky
    document.getElementById("byTeam").style.display = "none"; // added Yantowsky
}

function calculateRowTotal(row, rowIndex) {
    let total = 0;
    let participantName = row.cells[0].textContent;
    let participant = participantsData.findIndex(p => p.name === participantName && p.rowIndex === rowIndex);
    let grade = 0;
    for (let i = 1; i < row.cells.length - 1; i++) {
        let cell = row.cells[i];
        if (cell) {
            let select = cell.querySelector('select');
            if (select) {
                grade = parseFloat(select.value) || 0;
                total += grade;
                let span = cell.querySelector('span');
                if (!span) {
                    span = document.createElement('span');
                    cell.appendChild(span);
                }
                span.textContent = grade;
            }
        }
    }
    if (participant !== -1) {
        participantsData.splice(participant, 1);
    }
    participantsData.push({ name: participantName, score: total, rowIndex: rowIndex });
    row.cells[row.cells.length - 1].textContent = total;
    return total;
}

function createGradeOptions(values) {
    let options = document.createDocumentFragment();
    for (let value of values) {
        let option = document.createElement('option');
        option.value = value.trim();
        option.textContent = value.trim();
        options.appendChild(option);
    }
    return options;
}

function createGradeSelect() {
    let select = document.createElement('select');
    select.className = 'main__select result-select';
    let defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = '0';
    select.appendChild(defaultOption);
    updateGradeSelectOptions(select);

    return select;
}

function updateGradeSelectOptions(select) {
    let scoringSystemValues = scoringSystemInput.value.split(',');

    select.innerHTML = '';

    let defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = '0';
    select.appendChild(defaultOption);

    for (let value of scoringSystemValues) {
        let option = document.createElement('option');
        option.value = value.trim();
        option.textContent = value.trim();
        select.appendChild(option);
    }
}

function showResults() {
    let participantsCount = document.getElementById('participants').value;
    let judgesCount = document.getElementById('judgesCount').value;

    resultsContainer.innerHTML = '';

    let table = document.createElement('table');
    let headerRow = table.insertRow(0);
    headerRow.insertCell(0).textContent = 'Учасник 🠿/ Суддя 🡂';

    for (let i = 1; i <= judgesCount; i++) {
        headerRow.insertCell(i).textContent = judgesNames[i - 1];
    }

    headerRow.insertCell(-1).textContent = 'Сума балів';

    for (let i = 1; i <= participantsCount; i++) {
        let row = table.insertRow(i);
        row.insertCell(0).textContent = participantsNames[i - 1];

        for (let j = 1; j <= judgesCount; j++) {
            let cell = row.insertCell(j);
            let select = createGradeSelect();
            select.addEventListener('change', function () {
                calculateRowTotal(row, i);
            });
            cell.appendChild(select);
        }

        // Add an additional cell for the row sum
        let totalCell = row.insertCell(-1);
        totalCell.textContent = calculateRowTotal(row, i);
    }

    resultsContainer.appendChild(table);

    document.getElementById("resultsContainer").style.display = "block";
    document.getElementById("btn_result").style.display = "block"; // added Yantowsky
    document.getElementById("winnersList").style.display = "none"; // added Yantowsky
    document.getElementById("winnersContainer").style.display = "none"; // added Yantowsky
    document.getElementById("byTeam").style.display = "none"; // added Yantowsky
}

function showVotingResult() {
    let sortedResults = participantsData.slice().sort((a, b) => b.score - a.score);
    let winnersList = document.getElementById('winnersList');
    winnersList.innerHTML = '';
    let winnersContainer = document.getElementById('winnersContainer');
    winnersContainer.innerHTML = '';
    let resultList = document.createElement('ul');
    let currentPlace = 1;
    let previousScore = null;
    let currentPlaceResults = [];

    sortedResults.forEach((result) => {
        let listItem = document.createElement('li');

        if (previousScore !== null && result.score < previousScore) {
            appendPlaceResults(currentPlaceResults, currentPlace);
            currentPlaceResults = [];
            currentPlace++;
        }

        currentPlaceResults.push({ name: result.name, score: result.score });

        listItem.textContent = `${currentPlace} місце ➭ ${result.name} ➭ ${result.score} балів`;
        resultList.appendChild(listItem);

        previousScore = result.score;
    });

    appendPlaceResults(currentPlaceResults, currentPlace);

    winnersList.appendChild(resultList);

    document.getElementById("winnersList").style.display = "block"; // added Yantowsky
    document.getElementById("winnersContainer").style.display = "block"; // added Yantowsky
    document.getElementById("byTeam").style.display = "block"; // added Yantowsky
}

function appendPlaceResults(results, place) {
    if (results.length > 0 && place <= 3) {
        let placeText = getPlaceText(place);
        let placeItem = document.createElement('p');
        let names = results.map(result => result.name).join(', ');
        placeItem.textContent = `${placeText} ${names} ➭ ${results[0].score} балів`;
        winnersContainer.appendChild(placeItem);
    }
}

function getPlaceText(place) {
    switch (place) {
        case 1:
            return "🥇 Переможець:";
        case 2:
            return "🥈 Друге місце:";
        case 3:
            return "🥉 Третє місце:";
        default:
            return `${place}-е місце:`;
    }
}
