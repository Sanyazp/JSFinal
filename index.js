const SEARCH_INPUT = document.getElementById('search_input');
const SAVED = document.getElementById('favourite');
const SEARCHED = document.getElementById('searched_a');
var picArr = []; // Массив, в который передаются результаты нашего поиска
var favArr = JSON.parse(localStorage.getItem('favourite')) || []; // Берет картинки из массива избранных в локальном хранилище, а если его нет то создает пустой массив
var page = 1; // Глобальная переменная получающая текущую страницу
var perpage = 20; // Глобальная переменная получающая количество элементов на одной странице
var pages = 1; // Глобальная переменная получающая количество страниц
var value = ''; // Глобальная переменная получающая текущее значение инпута для поиска
var total = 0; // Глобальный счетчик общих результатов ( TotalHits )
imgFavourite();

/// FUNCTIONS // 
function clickEvents(target) {
    if (target.classList.contains('add')) { // Добавить в избранное
        target.classList.remove('add');
        target.classList.add('done');
        for (var i = 0; i < picArr.length; i++) {
            if (picArr[i].previewURL === target.parentElement.children[0].src) { // Ищет элемент, который мы хотим добавить в массиве результатов
                favArr.push(picArr[i]); // Пушим в массив избранных элементов
                localStorage.setItem('favourite', JSON.stringify(favArr)); // Сохраняем в localStorage
            } else {
                continue;
            }
        }
    } else if (target.classList.contains('remove')) { // Удалить из избранного
        for (var i = 0; i < favArr.length; i++) {
            if (favArr[i].previewURL === target.parentElement.children[0].src) {
                favArr.splice(i, 1);
                localStorage.setItem('favourite', JSON.stringify(favArr)); // Сохраняем в localStorage
            }
        }
        target.parentElement.remove();
    } else if (target.outerHTML.indexOf('img') >= 0) {
        var new_arr = favArr.concat(picArr);
        for (var i = 0; i < new_arr.length; i++) {
            if (new_arr[i].previewURL == target.src) {
                window.open(`https://pixabay.com/en/users/${new_arr[i].user}-${new_arr[i].user_id}/`);
            }
        }
    }

}

function search(tags, page, perpage) { // Функция запроса XHR
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        picArr = (JSON.parse(xhr.responseText).hits); // Запись результатов поиска в наш массив
        pages = Math.round(JSON.parse(xhr.responseText).totalHits / perpage) || 1; // Рассчет количества страничек
        total = JSON.parse(xhr.responseText).totalHits; // Получение общего кол-ва результатов
        imgSearched(); // Отобразить картинки исходя из результата XHR запроса
        imgFavourite(); // Отобразить избранные картинки
        document.getElementById('pages').innerHTML = `Pages : ${pages}`; // Обновление счетчиков
        document.getElementById('page').innerHTML = `Page : ${page}`;
        document.getElementById('res').innerHTML = `Total : ${total}`;
    }
    xhr.open('GET', `https://pixabay.com/api/?key=10255076-6e555d50ec8dc7604a9fe7e66&q=${tags}&image_type=photo&page=${page}&per_page=${perpage}`);
    xhr.send();
}

function imgSearched() { // Функция отображающая картинки из массива picArr (результат запроса XHR)
    SEARCHED.innerHTML = '';
    for (var i = 0; i < picArr.length; i++) {
        var new_div = document.createElement('div');
        var new_img = document.createElement('img');
        var new_span = document.createElement('span');
        new_div.classList.add('img');
        new_span.classList.add('add');
        for (var y = 0; y < favArr.length; y++) { // Проверка, есть ли уже картинка в избранном, если да то ее туда больше нельзя добавить
            if (favArr[y].previewURL == picArr[i].previewURL) {
                console.log(favArr[y].previewURL);
                new_span.classList.remove('add');
                new_span.classList.add('done');
                new_img.src = picArr[i].previewURL;
                SEARCHED.appendChild(new_div);
                new_div.appendChild(new_img);
                new_div.appendChild(new_span);
            }
        }
        new_img.src = picArr[i].previewURL;
        SEARCHED.appendChild(new_div);
        new_div.appendChild(new_img);
        new_div.appendChild(new_span);
    }
}

function imgFavourite() { // Исходя из массива с избранными картинками выводит их на экран
    SAVED.innerHTML = '';
    for (var i = 0; i < favArr.length; i++) {
        var new_div = document.createElement('div');
        var new_img = document.createElement('img');
        var new_span = document.createElement('span');
        new_div.classList.add('img');
        new_span.classList.add('remove');
        new_img.src = favArr[i].previewURL;
        SAVED.appendChild(new_div);
        new_div.appendChild(new_img);
        new_div.appendChild(new_span);
    }
}

document.getElementById('select').addEventListener('click', e => {
    perpage = e.target.value;
    page = 1;
    search(value, page, perpage);
})



SEARCH_INPUT.addEventListener('input', function(e) { // Функция поиска срабатывает при каждом изменении input'a
    page = 1; // Сбрасывает страницу до первой
    value = e.target.value;
    search(value, page, perpage);
})

SAVED.addEventListener('click', function(e) { // Функция поддерживающая актуальность картинок в избранном
    clickEvents(e.target);
    imgFavourite();
})

SEARCHED.addEventListener('click', function(e) {
    clickEvents(e.target);
    imgFavourite();
})


document.querySelector('div.input').addEventListener('click', function(e) { // Событие, перелистывающее страницы
    if (e.target.classList.contains('arrow')) {
        if (e.target.classList.contains('right')) {
            if (page < pages) {
                page++;
                search(value, page, perpage); // Вызывает функцию поиска
                document.getElementById('page').innerHTML = `Page : ${page}`; // Обновляет счетчик
            }
        } else if (e.target.classList.contains('left')) {
            if (page > 1) {
                page--;
                search(value, page, perpage); // Вызывает функцию поиска
                document.getElementById('page').innerHTML = `Page : ${page}`; // Обновляет счетчик
            }
        }
    }
})