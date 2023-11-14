let dynamicNumber = 1;

// Функція для додавання рядків до таблиці
function addRow(name, price, link) {
    let table = document.getElementById("dynamicTable");
    let newRow = table.insertRow(1); // Вставляємо новий рядок на другий рядок (після заголовку)
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    let cell4 = newRow.insertCell(3);

    cell1.innerHTML = dynamicNumber++;
    cell2.innerHTML = name;
    cell3.innerHTML = price;
    cell4.innerHTML = '<a href="' + link + '">Посилання</a>';

    playNotificationSound(); // Відтворюємо звук сповіщення
}

// Функція для сортування таблиці за вказаним стовпчиком
function sortTable(columnIndex) {
    // Ваш код для сортування, аналогічно попередньому прикладу
}

// Функція для відтворення звуку сповіщення
function playNotificationSound() {
    let audio = document.getElementById("notificationSound");
    audio.play();
}

// Симулюємо додавання інформації
$(document).ready(function() {
    addRow("Продукт 1", 10.00, "link1.html");
    addRow("Продукт 2", 15.00, "link2.html");
    addRow("Продукт 2", 25.00, "link2.html");
    // Додайте інші рядки за потребою
});