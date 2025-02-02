module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) => {
        const skills = 	['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuerry', 'Node', 'Angular',
             'VueJS', 'ReactJS', 'React Hooks', 'Redux','Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel',
              'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Moongose', 'SQL', 'MVC', 'SASS', 'WordPress'];

              let html = '';
              skills.forEach(skills => {
                html += `
                <li ${seleccionadas.includes(skills) ? 'class="activo"': ''}>${skills}</li>
                `;
              });
              return opciones.fn().html = html;
    },
    tipoContrato: (seleccionado, opciones) => {
      return opciones.fn(this).replace(
        new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
      )
    },
    mostrarAlertas: (errores = {}, alertas) => {
      const categoria = Object.keys(errores);

      let html = "";
      if(categoria.length) {
        errores[categoria].forEach(error => {
          html += `<div class="${categoria} alerta">
              ${error}
          </div>`;
        }) 
      }
      return alertas.fn().html = html;

    }
}