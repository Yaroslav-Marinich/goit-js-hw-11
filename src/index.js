import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

let page = 1;

refs.btnLoadMore.style.display = 'none'; 
refs.form.addEventListener('submit', onSearchForm); 

refs.btnLoadMore.addEventListener('click', onBtnLoadMore); 

function onSearchForm(event) {
  event.preventDefault(); 
  refs.gallery.innerHTML = ''; 
  const inputEl = refs.input.value.trim(); 

  if (inputEl !== '') {
    pixabay(inputEl);
  } else {
    refs.btnLoadMore.style.display = 'none';
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function onBtnLoadMore() {
  const input = refs.input.value.trim();
  page += 1; 
  pixabay(input, page); 
}

async function pixabay(input, page) {
  const URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '34665236-4ec5151bb97db3fa4ba359d90', 
      q: input,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(URL, options);
    notification(
      response.data.hits.length, 
      response.data.total 
    );

    createMarkup(response.data); 
  } catch (error) {
    console.log('Error:', error);
  }
}

function createMarkup(array) {
  const markup = array.hits
    .map(
      item =>
        `<a class="photo-link" href="${item.largeImageURL}">
            <div class="photo-card">
            <div class="photo">
            <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy"/>
            </div>
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${item.likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${item.views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${item.comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${item.downloads}
                        </p>
                    </div>
            </div>
        </a>`
    )
    .join(''); 
  refs.gallery.insertAdjacentHTML('beforeend', markup); 
  simpleLightBox.refresh(); 
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function notification(length, totalHits) {
  if (length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (page === 1) {
    refs.btnLoadMore.style.display = 'flex'; 
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (length < 40) {
    refs.btnLoadMore.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}