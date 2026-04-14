document.getElementById('navToggle').addEventListener('click', ()=>{
  const nav = document.getElementById('mainNav');
  if (nav.style.display === 'flex') nav.style.display = 'none';
  else nav.style.display = 'flex';
});

const form = document.getElementById('contactForm');
const result = document.getElementById('formResult');
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim()
  };
  if (!data.name || !data.email || !data.message) {
    result.textContent = 'Please fill all fields.';
    return;
  }
  result.textContent = 'Thanks! Your message was received (demo).';
  form.reset();
});
