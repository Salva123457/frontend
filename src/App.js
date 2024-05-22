import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const modalities = {
  Científic: "El batxillerat científic està orientat a l'estudi de les ciències experimentals i la tecnologia.",
  Arts: "El batxillerat d'arts està centrat en disciplines artístiques com pintura, escultura i disseny.",
  Escenicomusical: "El batxillerat escenicomusical es focalitza en les arts escèniques i la música.",
  Tecnològic: "El batxillerat tecnològic prepara els estudiants per carreres en enginyeria i tecnologia.",
  Social: "El batxillerat social tracta sobre les ciències socials i humanitats.",
  Humanístic: "El batxillerat humanístic està orientat a l'estudi de les humanitats i les ciències socials."
};

function App() {
  const [form, setForm] = useState({
    name: '',
    city: '',
    gender: '',
    interests: '',
    modality: '',
    batxilleratGrade: '',
    selectivitatGrade: '',
  });

  const [selectedModality, setSelectedModality] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleModalityChange = (e) => {
    const selected = e.target.value;
    setForm({
      ...form,
      modality: selected,
    });
    setSelectedModality(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Dades a enviar:', form);
    try {
      const response = await axios.post('http://localhost:5000/api/estudiants', form);
      console.log('Resposta del servidor:', response.data);
      
      // Fer la petició a chatGPT
      const chatGptResponse = await axios.post('http://localhost:5000/api/chatgpt', form);
      console.log('Recomanació de chatGPT:', chatGptResponse.data.recommendation);

      setRecommendation(chatGptResponse.data.recommendation);
      toast.success(`Dades guardades correctament! Recomanació de carrera: ${chatGptResponse.data.recommendation}`);
    } catch (error) {
      console.error('Error enviant les dades:', error.response ? error.response.data : error.message);
      toast.error('Error enviant les dades: ' + (error.response ? error.response.data : error.message));
    }
  };

  const handleDownloadData = async (endpoint, filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/export/${endpoint}`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(`Error descarregant les dades de ${filename}:`, error);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Nom i cognoms:
          <input type="text" name="name" onChange={handleChange} />
        </label>
        <label>
          Ciutat de naixement:
          <input type="text" name="city" onChange={handleChange} />
        </label>
        <label>
          Gènere:
          <select name="gender" onChange={handleChange}>
            <option value="">Selecciona un gènere</option>
            <option value="masculí">Masculí</option>
            <option value="femení">Femení</option>
          </select>
        </label>
        <label>
          Interessos:
          <input type="text" name="interests" onChange={handleChange} />
        </label>
        <label>
          Modalitat de batxillerat estudiada:
          <select name="modality" onChange={handleModalityChange}>
            <option value="">Selecciona una modalitat</option>
            {Object.keys(modalities).map((modality) => (
              <option key={modality} value={modality}>
                {modality}
              </option>
            ))}
          </select>
        </label>
        {selectedModality && (
          <div className="modality-description">
            <p>{modalities[selectedModality]}</p>
          </div>
        )}
        <label>
          Nota de batxillerat:
          <input type="number" name="batxilleratGrade" step="0.01" onChange={handleChange} />
        </label>
        <label>
          Nota de selectivitat:
          <input type="number" name="selectivitatGrade" step="0.01" onChange={handleChange} />
        </label>
        <button type="submit">Enviar</button>
      </form>
      <button onClick={() => handleDownloadData('estudiants', 'estudiants')}>Descarregar Dades Estudiants</button>
      <ToastContainer />
      {recommendation && (
        <div className="recommendation">
          <h2>Recomanació de carrera:</h2>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
