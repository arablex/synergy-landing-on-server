// main.js — скрипты лендинга (нативный JS, без библиотек)
'use strict';

/* ---------- 1. Переменные: ищем элементы на странице ---------- */
const overlay = document.getElementById('modal-overlay');     // контейнер модального окна
const closeBtn = document.getElementById('modal-close');      // кнопка-крестик
const openButtons = document.querySelectorAll('.js-open-modal'); // все кнопки «Оставить заявку»
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const toTop = document.getElementById('to-top');
const contactForm = document.getElementById('contact-form');
const modalForm = document.getElementById('modal-form');

/* ---------- 2. Модальное окно: открытие и закрытие ---------- */
let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  overlay.hidden = false;
  document.body.classList.add('is-locked');       // блокируем прокрутку страницы под окном
  modalForm.querySelector('input').focus();
}

function closeModal() {
  overlay.hidden = true;
  document.body.classList.remove('is-locked');
  if (lastFocused) lastFocused.focus();
}

// Обработчики событий на переменные
openButtons.forEach((btn) => btn.addEventListener('click', openModal));
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {         // клик по тёмному фону закрывает окно
  if (e.target === overlay) closeModal();
});
document.addEventListener('keydown', (e) => {      // клавиша Esc тоже закрывает
  if (e.key === 'Escape' && !overlay.hidden) closeModal();
});

/* ---------- 3. Бургер-меню на мобильных ---------- */
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {              // после клика по пункту меню закрываем
  if (e.target.tagName === 'A') {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- 4. Аккордеон «Частые вопросы» ---------- */
document.querySelectorAll('.faq__question').forEach((q) => {
  q.addEventListener('click', () => {
    const answer = q.nextElementSibling;
    const open = q.getAttribute('aria-expanded') === 'true';
    q.setAttribute('aria-expanded', String(!open));
    answer.style.maxHeight = open ? '0' : answer.scrollHeight + 'px';
  });
});

/* ---------- 5. Счётчики в первом экране (анимация чисел) ---------- */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCounter(el) {
  const target = Number(el.dataset.target);
  if (reducedMotion) { el.textContent = target; return; }   // без анимации — сразу итоговое число
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * p);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll('.counter').forEach(animateCounter);

/* ---------- 6. Проверка форм ---------- */
const validators = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Введите имя (не короче 2 символов)'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Введите корректный email, например name@example.com'),
  message: (v) => (v.trim().length >= 10 ? '' : 'Сообщение слишком короткое (минимум 10 символов)'),
  phone: (v) => (/^\+?[\d\s()-]{10,18}$/.test(v.trim()) ? '' : 'Введите телефон, например +7 900 000-00-00'),
};

// Показать/убрать ошибку под полем
function setError(input, text) {
  const field = input.closest('.field');
  field.classList.toggle('is-invalid', Boolean(text));
  field.querySelector('.field__error').textContent = text;
}

// Проверка всех полей формы; возвращает true, если ошибок нет
function validateForm(form) {
  let ok = true;
  form.querySelectorAll('input, textarea').forEach((input) => {
    const error = validators[input.name](input.value);
    setError(input, error);
    if (error) ok = false;
  });
  return ok;
}

// Подключаем проверку и отправку к форме
function setupForm(form, statusEl, successText, onSuccess) {
  // ошибка пропадает, как только пользователь начал исправлять поле
  form.addEventListener('input', (e) => setError(e.target, ''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.className = 'form__status';
    if (!validateForm(form)) {
      statusEl.textContent = 'Проверьте поля формы';
      statusEl.classList.add('is-error');
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    statusEl.textContent = 'Отправляем...';
    try {
      await sendToServer(data);
      statusEl.textContent = successText;
      statusEl.classList.add('is-ok');
      form.reset();
      if (onSuccess) setTimeout(onSuccess, 1800);
    } catch (err) {
      statusEl.textContent = 'Не удалось отправить, попробуйте позже';
      statusEl.classList.add('is-error');
    }
  });
}

// Отправка на сервер. Своего бэкенда у статического лендинга нет, поэтому запрос имитируется.
// Чтобы отправлять данные на реальный адрес, замените тело функции на:
//   const res = await fetch('/api/lead', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
//   if (!res.ok) throw new Error('HTTP ' + res.status);
function sendToServer(data) {
  console.log('Заявка:', data);
  return new Promise((resolve) => setTimeout(resolve, 600));
}

setupForm(contactForm, document.getElementById('form-status'), 'Спасибо! Сообщение отправлено.');
setupForm(modalForm, document.getElementById('modal-status'), 'Спасибо! Мы скоро перезвоним.', closeModal);

/* ---------- 7. Ссылка «Наверх» ---------- */
toTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Для проверки и скриншотов: адрес .../#modal открывает модальное окно сразу */
if (location.hash === '#modal') openModal();
