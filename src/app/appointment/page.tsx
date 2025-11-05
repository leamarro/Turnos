<form
  onSubmit={handleSubmit}
  className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-soft space-y-4"
>
  <h2 className="text-xl font-semibold mb-4 text-center">Reservar turno</h2>

  <div>
    <label className="block text-sm mb-1">Nombre</label>
    <input type="text" name="name" required />
  </div>

  <div>
    <label className="block text-sm mb-1">Teléfono</label>
    <input type="text" name="phone" required />
  </div>

  <div>
    <label className="block text-sm mb-1">Servicio</label>
    <select name="service" required>
      <option value="">Seleccionar servicio</option>
      <option value="maquillaje">Maquillaje</option>
      <option value="perfilado">Perfilado</option>
    </select>
  </div>

  <div className="flex gap-4">
    <div className="flex-1">
      <label className="block text-sm mb-1">Fecha</label>
      <input type="date" name="date" required />
    </div>
    <div className="flex-1">
      <label className="block text-sm mb-1">Hora</label>
      <input type="time" name="time" required />
    </div>
  </div>

  <input
    type="submit"
    value="Confirmar turno"
    className="w-full mt-4 bg-[var(--color-accent)] text-black py-2 rounded-lg font-medium hover:opacity-80"
  />
</form>
