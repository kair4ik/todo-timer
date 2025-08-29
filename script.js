let tasks = [
    {
        title: "Пример задачи",
        time: 0,
        interval: null,
        mode: "inactive",
        done: false,
        manualStart: false,
        subtasks: [
            { title: "Подзадача 1", time: 0, interval: null, mode: "inactive", done: false },
            { title: "Подзадача 2", time: 0, interval: null, mode: "inactive", done: false },
            { title: "Подзадача 3", time: 0, interval: null, mode: "inactive", done: false }
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
        document.getElementById(`timer-${i}`).textContent = formatTime(tasks[i].time);
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
    if (tasks[i].done) pauseTimer(i);
    renderTasks();
}

function toggleSubDone(i, j) {
    const sub = tasks[i].subtasks[j];
    sub.done = !sub.done;
    if (sub.done) pauseSub(i, j);
    renderSubtasks(i);
}

function changeMode(i, mode) {
    tasks[i].mode = mode;
    renderTasks();
}

function changeSubMode(i, j, mode) {
    tasks[i].subtasks[j].mode = mode;
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
        done: false
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
        document.getElementById(`subtimer-${i}-${j}`).textContent = formatTime(sub.time);
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

function renderSubtasks(i) {
    const container = document.getElementById(`subtasks-${i}`);
    container.innerHTML = '';
    tasks[i].subtasks.forEach((sub, j) => {
        const isActive = sub.interval !== null && !sub.done;
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
        container.appendChild(div);
    });
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach((task, i) => {
        const isActive = task.interval !== null && task.manualStart && !task.done;
        const div = document.createElement('div');
        div.className = `task ${task.done ? 'done' : isActive ? 'active-task mode-' + task.mode : 'inactive'}`;
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
        list.appendChild(div);
        renderSubtasks(i);
    });
}

renderTasks();
