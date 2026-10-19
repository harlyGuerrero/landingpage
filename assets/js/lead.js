/* Nuova — formulario corporativo compartido por las 3 propuestas.
   Sin endpoint aún: valida, arma el mensaje y abre WhatsApp con los datos. */
(function () {
  var WA = '51903260296';
  var DEPARTAMENTOS = ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco',
    'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
    'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'];

  // Rellena cualquier <select data-departamentos>
  document.querySelectorAll('select[data-departamentos]').forEach(function (sel) {
    DEPARTAMENTOS.forEach(function (d) {
      var o = document.createElement('option');
      o.value = d; o.textContent = d;
      if (d === 'Lima') o.selected = true;
      sel.appendChild(o);
    });
  });

  // Estado "en línea": lunes a sábado 8:00–18:00, hora de Lima (UTC-5)
  function enHorario() {
    var now = new Date();
    var lima = new Date(now.getTime() + now.getTimezoneOffset() * 60000 - 5 * 3600000);
    var d = lima.getDay(), h = lima.getHours();
    return d !== 0 && h >= 8 && h < 18;
  }
  document.querySelectorAll('[data-estado]').forEach(function (el) {
    var on = enHorario();
    el.dataset.estado = on ? 'on' : 'off';
    document.body.classList.toggle('is-off', !on);
    el.textContent = on ? 'Asesor en línea · lun–sáb 8:00–18:00' : 'Fuera de horario · te respondemos desde las 8:00';
  });

  var MSG = {
    empresa: 'Escribe el nombre de tu empresa.',
    nombre: 'Escribe tu nombre.',
    cargo: 'Indica tu cargo para derivarte al asesor correcto.',
    telefono: 'Escribe un teléfono de 9 dígitos (ej. 987 654 321).',
    correo: 'Revisa el correo: debe tener el formato nombre@empresa.com.',
    tiendas: 'Indica cuántas tiendas (1 o más).'
  };

  function validar(field) {
    var v = field.value.trim(), ok = true;
    if (field.required && !v) ok = false;
    else if (field.name === 'telefono' && v) ok = /^9\d{8}$/.test(v.replace(/[\s-]/g, '').replace(/^\+?51/, ''));
    else if (field.name === 'correo' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    else if (field.name === 'tiendas' && v) ok = parseInt(v, 10) >= 1;
    var err = field.closest('[data-campo]') && field.closest('[data-campo]').querySelector('[data-error]');
    field.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (err) err.textContent = ok ? '' : (MSG[field.name] || 'Completa este campo.');
    return ok;
  }

  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) validar(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') validar(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var campos = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
      var malos = campos.filter(function (f) { return !validar(f); });
      if (malos.length) { malos[0].focus(); return; }
      var data = new FormData(form);
      var lineas = ['Hola Nuova, quiero una propuesta de implementación corporativa.'];
      var etiquetas = { empresa: 'Empresa', nombre: 'Nombre', cargo: 'Cargo', telefono: 'Teléfono', correo: 'Correo',
        tiendas: 'Nº de tiendas', departamento: 'Destino', proyecto: 'Proyecto', mensaje: 'Detalle' };
      data.forEach(function (v, k) { if (String(v).trim()) lineas.push((etiquetas[k] || k) + ': ' + String(v).trim()); });
      var btn = form.querySelector('[type=submit]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Abriendo WhatsApp…'; }
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lineas.join('\n')), '_blank', 'noopener');
      form.classList.add('is-enviado');
      var ok = form.querySelector('[data-ok]');
      if (ok) { ok.hidden = false; ok.focus(); }
      setTimeout(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; } }, 2500);
    });
  });
})();
