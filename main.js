const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSELF';

function isSupportStorage() /* boolean */ {
    if (typeof (Storage) === undefined) {
      alert('Mohon Maaf Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    const submitSearch = document.getElementById('searchSubmit');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
    });

    submitSearch.addEventListener('click', function (event) {
      event.preventDefault();
      searchBook();
    });

    if (isSupportStorage()) {
        loadDataFromStorage();
      }
});

document.addEventListener(SAVED_EVENT, function (event) {
    const container = document.querySelector('.container-notif');
    container.innerHTML = '';
    const notif = document.createElement('div');
    const pesan = document.createElement('p');
    let nameEvent = event.detail;
    notif.classList.add('notif');
    
    pesan.innerText = `Anda Berhasil ${nameEvent} buku`;

    notif.appendChild(pesan);
    container.appendChild(notif);

});

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const bookisComplete = document.getElementById('inputBookIsComplete').checked ? true : false;
   
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, bookisComplete);
    books.push(bookObject);
   
    document.dispatchEvent(new Event(RENDER_EVENT));

    function generateId() {
        return +new Date();
    }
       
      function generateBookObject(id, title, author, year, isComplete) {
        return {
          id,
          title,
          author,
          year,
          isComplete,
        }
      }

      saveData('Menambahkan');
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';
   
    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';
   
    for (const bookitem of books) {
      const bookElement = makeBook(bookitem);

      if (!bookitem.isComplete) {
        uncompletedBookList.append(bookElement);
      } else {
        completedBookList.append(bookElement);
      }
        
    }
});

function makeBook(bookObject) {
    const valueTitle = document.createElement('h3');
    valueTitle.innerText = bookObject.title;
   
    const valueAuthor = document.createElement('p');
    valueAuthor.innerText = bookObject.author;

    const valueYear = document.createElement('p');
    valueYear.innerText = bookObject.year;

   
    const textContainer = document.createElement('article');
    textContainer.classList.add('book_item');
    textContainer.setAttribute('id', `book-${bookObject.id}`);
    textContainer.append(valueTitle, valueAuthor, valueYear);

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');
    textContainer.append(actionContainer);
   
    // const container = document.createElement('div');
    // container.append(textContainer);
    // container.setAttribute('id', `book-${bookObject.id}`);
   
    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText = "Belum selesai di Baca";
     
        undoButton.addEventListener('click', function () {
          undoBookFromCompleted(bookObject.id);
        });
     
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = "Hapus buku";
     
        deleteButton.addEventListener('click', function () {
          removeBookFromCompleted(bookObject.id);
        });
     
        actionContainer.append(undoButton, deleteButton);
      } else {
        const complateButton = document.createElement('button');
        complateButton.classList.add('green');
        complateButton.innerText = "Selesai dibaca";

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = "Hapus buku";
        
        complateButton.addEventListener('click', function () {
          addBookToCompleted(bookObject.id);
        });
        deleteButton.addEventListener('click', function () {
          removeBookFromCompleted(bookObject.id);
        });
        
        actionContainer.append(complateButton, deleteButton);
      }
     
      return textContainer;
}

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData('Mengubah');
}

function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
   
    if (bookTarget === -1) return;
   
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData('Menghapus');
}
   
   
function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData('Mengubah');
}

function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
   
    return -1;
}

function saveData(nameevent) {
    if (isSupportStorage()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new CustomEvent(SAVED_EVENT,{detail: nameevent} ));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
    let searchBookTitle = document.getElementById('searchBookTitle').value;
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(searchBookTitle === "") {
        books.splice(0,books.length);
        loadDataFromStorage();
    } else{
        for (const book of data) {
            if(book.title == searchBookTitle){
                books.splice(0,books.length);
                books.push(book);
            } else {
              console.log('a');
              books.splice(0,books.length);
            }
          }
    }


    document.dispatchEvent(new Event(RENDER_EVENT));
    
}