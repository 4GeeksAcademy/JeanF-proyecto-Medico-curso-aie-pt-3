const form = document.getElementById('application-form');
const alertBox = document.getElementById('form-alert');
const clearButton = document.getElementById('clear-form');

const rules = {
  fullName: {
    validate: (value) => value.trim().length >= 5,
    message: 'Ingresa tu nombre completo (mínimo 5 caracteres).'
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()),
    message: 'Ingresa un correo electrónico válido.'
  },
  phone: {
    validate: (value) => /^\+?[\d\s().-]{8,20}$/.test(value.trim()),
    message: 'Ingresa un teléfono válido con prefijo internacional o número local completo.'
  },
  country: {
    validate: (value) => value.trim() !== '',
    message: 'Selecciona tu país de residencia.'
  },
  department: {
    validate: (value) => value.trim() !== '',
    message: 'Selecciona un área de interés principal.'
  },
  role: {
    validate: (value) => value.trim().length >= 3,
    message: 'Ingresa el rol objetivo (mínimo 3 caracteres).'
  },
  experience: {
    validate: (value) => {
      const years = Number(value);
      return Number.isFinite(years) && years >= 0 && years <= 50;
    },
    message: 'Ingresa años de experiencia entre 0 y 50.'
  },
  availability: {
    validate: (value) => value.trim() !== '',
    message: 'Selecciona tu disponibilidad de inicio.'
  },
  challenge: {
    validate: (value) => value.trim().length >= 120,
    message: 'Tu respuesta debe tener al menos 120 caracteres.'
  },
  skills: {
    validate: (value) => value.trim().length >= 8,
    message: 'Describe tu stack técnico principal (mínimo 8 caracteres).'
  },
  linkedin: {
    validate: (value) => {
      try {
        const parsed = new URL(value.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    message: 'Ingresa una URL válida que comience por http:// o https://.'
  },
  workAuth: {
    validate: (value) => value.trim() !== '',
    message: 'Selecciona tu estatus de autorización laboral.'
  },
  consent: {
    validate: (_, field) => field.checked,
    message: 'Debes aceptar el consentimiento para continuar.'
  }
};

function setFieldError(field, message) {
  const errorNode = document.getElementById(`${field.id}-error`);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');

  if (message) {
    field.classList.add('border-rose-400', 'ring-2', 'ring-rose-400/40');
    field.classList.remove('border-slate-600');
  } else {
    field.classList.remove('border-rose-400', 'ring-2', 'ring-rose-400/40');
    field.classList.add('border-slate-600');
  }

  if (errorNode) {
    errorNode.textContent = message;
  }
}

function validateField(fieldName) {
  const field = form.elements[fieldName];
  const rule = rules[fieldName];
  const value = field.type === 'checkbox' ? '' : field.value;
  const isValid = rule.validate(value, field);

  setFieldError(field, isValid ? '' : rule.message);
  return isValid;
}

function showAlert(message, type) {
  alertBox.classList.remove('hidden', 'border-rose-400', 'bg-rose-200/10', 'text-rose-100', 'border-emerald-400', 'bg-emerald-200/10', 'text-emerald-100');

  if (type === 'error') {
    alertBox.classList.add('border-rose-400', 'bg-rose-200/10', 'text-rose-100');
  } else {
    alertBox.classList.add('border-emerald-400', 'bg-emerald-200/10', 'text-emerald-100');
  }

  alertBox.textContent = message;
}

function hideAlert() {
  alertBox.classList.add('hidden');
  alertBox.textContent = '';
}

if (form) {
  Object.keys(rules).forEach((fieldName) => {
    const field = form.elements[fieldName];
    const eventName = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';

    field.addEventListener(eventName, () => {
      validateField(fieldName);
      hideAlert();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalidFields = Object.keys(rules).filter((fieldName) => !validateField(fieldName));

    if (invalidFields.length > 0) {
      const firstInvalid = form.elements[invalidFields[0]];
      firstInvalid.focus();
      showAlert('Revisa los campos marcados en rojo antes de enviar.', 'error');
      return;
    }

    showAlert('Aplicación enviada correctamente. Nuestro equipo revisará tu perfil y te contactará pronto.', 'success');
    form.reset();
    Object.keys(rules).forEach((fieldName) => {
      const field = form.elements[fieldName];
      setFieldError(field, '');
    });
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      form.reset();
      hideAlert();
      Object.keys(rules).forEach((fieldName) => {
        const field = form.elements[fieldName];
        setFieldError(field, '');
      });
      form.elements.fullName.focus();
    });
  }
}
