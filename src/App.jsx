import { useState } from 'react'
import { URL_PREASIGNADA } from './config'
import './App.css'

// PASO 3: Procesamiento de la respuesta.
// Convierte un objeto JSON en una lista de pares campo/valor.
function procesarJSON(datos) {
  const objeto = Array.isArray(datos) ? datos[0] : datos
  return Object.entries(objeto ?? {}).map(([campo, valor]) => ({
    campo,
    valor: typeof valor === 'object' ? JSON.stringify(valor) : String(valor),
  }))
}

function App() {
  // Estados: 'inactivo' | 'cargando' | 'exito' | 'error'
  const [estado, setEstado] = useState('inactivo')
  const [campos, setCampos] = useState([])
  const [texto, setTexto] = useState('')

  async function consultar() {
    setEstado('cargando')
    setCampos([])
    setTexto('')

    try {
      // PASO 2: Solicitud HTTP (GET) a la URL preasignada (PASO 1)
      const res = await fetch(URL_PREASIGNADA, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const tipo = res.headers.get('content-type') ?? ''
      if (tipo.includes('application/json')) {
        const datos = await res.json() // JSON -> objeto JavaScript
        setCampos(procesarJSON(datos))
      } else {
        setTexto(await res.text())
      }
      setEstado('exito')
    } catch (error) {
      console.error('Error en la consulta:', error)
      setEstado('error')
    }
  }

  return (
    <main className="contenedor">
      <h1>Consulta de información</h1>

      <button onClick={consultar} disabled={estado === 'cargando'}>
        CONSULTAR
      </button>

      {estado === 'cargando' && (
        <div className="cargando" role="status">
          <span className="spinner" />
          <p>Consultando...</p>
        </div>
      )}

      {estado === 'error' && (
        <p className="error" role="alert">
          No fue posible obtener la información.
        </p>
      )}

      {estado === 'exito' && (
        <section className="respuesta">
          <h2>Respuesta</h2>

          {campos.length > 0 && (
            <table className="tabla">
              <tbody>
                {campos.map(({ campo, valor }) => (
                  <tr key={campo}>
                    <th>{campo}</th>
                    <td>{valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {texto && <pre>{texto}</pre>}
        </section>
      )}
    </main>
  )
}

export default App