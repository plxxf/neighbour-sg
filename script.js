const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('is-open', !open);
});

document.querySelector('.postcode-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  const button = event.currentTarget.querySelector('button');
  input.setCustomValidity('');
  if (!input.validity.valid) {
    input.setCustomValidity('Please enter a valid email address.');
    input.reportValidity();
    return;
  }
  input.setCustomValidity('');
  button.textContent = 'Thanks — we’ll be in touch ✓';
});
