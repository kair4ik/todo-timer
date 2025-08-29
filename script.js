let tasks = [
    {
        title: "Пример задачи",
        time: 0,
        interval: null,
        mode: "inactive",
        done: false,
        manualStart: false,
        timeSpent: {
            productive: 0,
            exploration: 0,
            stalling: 0
        },
        subtasks: [
            { title: "Подзадача 1", time: 0, interval: null, mode: "inactive", done: false, timeSpent: { productive: 0, exploration: 0, stalling: 0 } },
            { title: "Подзадача 2", time: 0, interval: null, mode: "inactive", done: false, timeSpent: { productive: 0, exploration: 0, stalling: 0 } },
            { title: "Подзадача 3", time: 0, interval: null, mode: "inactive", done: false, timeSpent: { productive: 0, exploration: 0, stalling: 0 } }
        ]
    }
];

function addTask() {
    const title = document.getElementById('taskInput').value.trim();
    if (!title) return;
    tasks.push({
        title,
        time: 0,
        interval: null,
        mode: 'inactive',
        done: false,
        manualStart: false,
        timeSpent: {
            productive: 0,
            exploration: 0,
            stalling: 0
        },
        subtasks: []
    });
    document.getElementById('taskInput').value = '';
    renderTasks();
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function startTimer(i, manual = true) {
    tasks.forEach((task, idx) => {
        if (idx !== i) {
            pauseTimer(idx);
            task.subtasks.forEach((_, j) => pauseSub(idx, j));
        }
    });

    if (tasks[i].interval) return;
    tasks[i].interval = setInterval(() => {
        tasks[i].time++;
        tasks[i].timeSpent[tasks[i].mode]++; // Увеличиваем время для текущего режима
        document.getElementById(`timer-${i}`).textContent = formatTime(tasks[i].time);
        updatePieChart(i);
    }, 1000);
    if (tasks[i].mode === 'inactive') tasks[i].mode = 'productive';
    tasks[i].manualStart = manual;
    renderTasks();
}

function pauseTimer(i) {
    clearInterval(tasks[i].interval);
    tasks[i].interval = null;
    tasks[i].mode = 'inactive';
    tasks[i].manualStart = false;
    renderTasks();
}

function deleteTask(i) {
    clearInterval(tasks[i].interval);
    tasks.splice(i, 1);
    renderTasks();
}

function toggleDone(i) {
    tasks[i].done = !tasks[i].done;
    if (tasks[i].done) {
        pauseTimer(i);
        tasks[i].manualStart = false; // Ensure the task is no longer marked as active
    }
    renderTasks();
}

function toggleSubDone(i, j) {
    const sub = tasks[i].subtasks[j];
    sub.done = !sub.done;
    if (sub.done) {
        pauseSub(i, j);
        sub.manualStart = false; // Ensure the subtask is no longer marked as active
    }
    renderSubtasks(i);
}

function changeMode(i, mode) {
    if (tasks[i].mode !== mode) {
        tasks[i].mode = mode;
    }
    renderTasks();
}


function changeSubMode(i, j, mode) {
    const sub = tasks[i].subtasks[j];
    if (sub.mode !== mode) {
        sub.mode = mode;
    }
    renderSubtasks(i);
}


function addSubtask(i, input) {
    const title = input.value.trim();
    if (!title) return;
    tasks[i].subtasks.push({
        title,
        time: 0,
        interval: null,
        mode: 'inactive',
        done: false,
        timeSpent: {
            productive: 0,
            exploration: 0,
            stalling: 0
        }
    });
    input.value = '';
    renderSubtasks(i);
}

function startSub(i, j) {
    tasks.forEach((task, idx) => {
        if (idx !== i) {
            pauseTimer(idx);
            task.subtasks.forEach((_, j2) => pauseSub(idx, j2));
        }
    });

    tasks[i].subtasks.forEach((sub, idx) => {
        if (idx !== j) pauseSub(i, idx);
    });

    const sub = tasks[i].subtasks[j];
    if (sub.interval) return;
    sub.interval = setInterval(() => {
        sub.time++;
        sub.timeSpent[sub.mode]++; // Увел������чиваем время для текущего режима подзадачи
        document.getElementById(`subtimer-${i}-${j}`).textContent = formatTime(sub.time);
        updatePieChart(i, j);
    }, 1000);
    if (sub.mode === 'inactive') sub.mode = 'productive';
    if (!tasks[i].interval) startTimer(i, false);
    renderSubtasks(i);
}

function pauseSub(i, j) {
    const sub = tasks[i].subtasks[j];
    clearInterval(sub.interval);
    sub.interval = null;
    sub.mode = 'inactive';
    renderSubtasks(i);
}

function createPieChart(percentages, id) {
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    if (id) canvas.id = id;

    const ctx = canvas.getContext('2d');
    const colors = {
        productive: 'limegreen',
        exploration: 'cyan',
        stalling: 'orange'
    };

    const total = percentages.productive + percentages.exploration + percentages.stalling;
    if (total === 0) return canvas;

    let startAngle = 0;
    Object.keys(percentages).forEach((key) => {
        const value = percentages[key];
        if (value <= 0) return;
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.arc(10, 10, 10, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[key];
        ctx.fill();
        startAngle += sliceAngle;
    });

    return canvas;
}



function updatePieChart(i, j = null) {
    const canvasId = j === null ? `chart-${i}` : `subchart-${i}-${j}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let percentages;
    if (j === null) {
        const task = tasks[i];
        const own = calculatePercentages(task.timeSpent);
        const subs = aggregateSubtaskPercentages(task.subtasks);
        percentages = {
            productive: own.productive + subs.productive,
            exploration: own.exploration + subs.exploration,
            stalling: own.stalling + subs.stalling
        };
    } else {
        percentages = calculatePercentages(tasks[i].subtasks[j].timeSpent);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPieChart(ctx, percentages);
}

function drawPieChart(ctx, percentages) {
    const colors = {
        productive: 'limegreen',
        exploration: 'cyan',
        stalling: 'orange'
    };

    const total = percentages.productive + percentages.exploration + percentages.stalling;
    if (total === 0) return; // ничего не рисуем

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let startAngle = 0;
    Object.keys(percentages).forEach((key) => {
        const value = percentages[key];
        if (value <= 0) return;

        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.arc(10, 10, 10, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[key];
        ctx.fill();
        startAngle += sliceAngle;
    });
}

function renderSubtasks(i) {
    const container = document.getElementById(`subtasks-${i}`);
    container.innerHTML = '';
    tasks[i].subtasks.forEach((sub, j) => {
        const isActive = sub.interval !== null && !sub.done;
        const percentages = calculatePercentages(sub.timeSpent);

        const div = document.createElement('div');
        div.className = `subtask ${sub.done ? 'done' : isActive ? 'active-task mode-' + sub.mode : 'inactive'}`;
        div.innerHTML = `
      ↳ ${sub.title} — <span id="subtimer-${i}-${j}">${formatTime(sub.time)}</span>
      ${sub.done ? `<span class="done-indicator" onclick="toggleSubDone(${i}, ${j})">✅</span>` : `
      <button class="btn start" onclick="startSub(${i}, ${j})">Start</button>
      <button class="btn pause" onclick="pauseSub(${i}, ${j})">Pause</button>
      <button onclick="changeSubMode(${i}, ${j}, 'productive')" class="btn mode-btn ${sub.mode === 'productive' ? 'active' : ''}">⚡</button>
      <button onclick="changeSubMode(${i}, ${j}, 'exploration')" class="btn mode-btn ${sub.mode === 'exploration' ? 'active' : ''}">🔍</button>
      <button onclick="changeSubMode(${i}, ${j}, 'stalling')" class="btn mode-btn ${sub.mode === 'stalling' ? 'active' : ''}">🐢</button>
      <button class="btn done-btn" onclick="toggleSubDone(${i}, ${j})">Done</button>`}
    `;

        const pieChart = createPieChart(percentages, `subchart-${i}-${j}`);
        pieChart.style.marginLeft = '10px';
        pieChart.style.verticalAlign = 'middle';
        div.querySelector(`#subtimer-${i}-${j}`).after(pieChart);

        container.appendChild(div);
    });
}

function calculatePercentages(timeSpent) {
    const total = timeSpent.productive + timeSpent.exploration + timeSpent.stalling;
    if (total === 0) return { productive: 0, exploration: 0, stalling: 0 };
    return {
        productive: Math.round((timeSpent.productive / total) * 100),
        exploration: Math.round((timeSpent.exploration / total) * 100),
        stalling: Math.round((timeSpent.stalling / total) * 100)
    };
}

function aggregateSubtaskPercentages(subtasks) {
    const aggregated = { productive: 0, exploration: 0, stalling: 0 };
    subtasks.forEach(sub => {
        aggregated.productive += sub.timeSpent.productive;
        aggregated.exploration += sub.timeSpent.exploration;
        aggregated.stalling += sub.timeSpent.stalling;
    });
    return calculatePercentages(aggregated);
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach((task, i) => {
        const isActive = task.interval !== null && task.manualStart && !task.done;
        const div = document.createElement('div');
        div.className = `task ${task.done ? 'done' : isActive ? 'active-task mode-' + task.mode : 'inactive'}`;

        const percentages = {
            productive: task.timeSpent.productive + aggregateSubtaskPercentages(task.subtasks).productive,
            exploration: task.timeSpent.exploration + aggregateSubtaskPercentages(task.subtasks).exploration,
            stalling: task.timeSpent.stalling + aggregateSubtaskPercentages(task.subtasks).stalling
        };

        div.innerHTML = `
      <strong>${task.title}</strong> — <span id="timer-${i}">${formatTime(task.time)}</span>
      ${task.done ? `<span class="done-indicator" onclick="toggleDone(${i})">✅</span>` : `
      <button class="btn start" onclick="startTimer(${i})">Start</button>
      <button class="btn pause" onclick="pauseTimer(${i})">Pause</button>
      <button class="btn delete" onclick="deleteTask(${i})">Delete</button>
      <div style="margin-top:5px;">
        <button onclick="changeMode(${i}, 'productive')" class="btn mode-btn ${task.mode === 'productive' ? 'active' : ''}">⚡</button>
        <button onclick="changeMode(${i}, 'exploration')" class="btn mode-btn ${task.mode === 'exploration' ? 'active' : ''}">🔍</button>
        <button onclick="changeMode(${i}, 'stalling')" class="btn mode-btn ${task.mode === 'stalling' ? 'active' : ''}">🐢</button>
      </div>
      <br><input placeholder="Добавить подзадачу" onkeydown="if(event.key==='Enter') addSubtask(${i}, this)">
      <button class="btn done-btn" onclick="toggleDone(${i})">Done</button>`}
      <div id="subtasks-${i}"></div>
    `;

        const pieChart = createPieChart(percentages, `chart-${i}`);
        pieChart.style.marginLeft = '10px';
        pieChart.style.verticalAlign = 'middle';
        div.querySelector(`#timer-${i}`).after(pieChart);

        list.appendChild(div);
        renderSubtasks(i);
    });
}


renderTasks();
