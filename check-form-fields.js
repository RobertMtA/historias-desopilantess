// Verificar elementos de formulario sin ID o name
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const url = 'https://histostorias-desopilantes.web.app/contacto';

async function checkFormFields() {
  try {
    console.log(`Verificando campos de formulario en ${url}...`);
    
    const response = await fetch(url);
    const html = await response.text();
    
    const $ = cheerio.load(html);
    
    // Buscar elementos de formulario sin ID o nombre
    const formElements = $('input, textarea, select');
    let issuesFound = 0;
    
    formElements.each((i, el) => {
      const hasId = $(el).attr('id') !== undefined;
      const hasName = $(el).attr('name') !== undefined;
      const type = $(el).attr('type') || $(el)[0].name;
      
      if (!hasId && !hasName) {
        issuesFound++;
        console.log(`PROBLEMA #${issuesFound}: Elemento ${el.name} tipo=${type} no tiene ID ni atributo name`);
        console.log('HTML:', $(el).parent().html());
      }
    });
    
    if (issuesFound === 0) {
      console.log('✅ No se encontraron problemas. Todos los campos del formulario tienen ID o atributo name.');
    } else {
      console.log(`❌ Se encontraron ${issuesFound} elementos de formulario sin ID ni atributo name.`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFormFields();
