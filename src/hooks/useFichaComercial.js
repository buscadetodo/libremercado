import { usePerfilActivo } from '../context/PerfilContext';

/**
 * ¿Al usuario le falta dar de alta la ficha comercial de alguno de sus perfiles?
 *
 * Por qué importa: tener el perfil de mayorista (tabla usuario_perfiles) NO es lo
 * mismo que tener el comercio cargado (POST /mayoristas/ con razón social, CUIT,
 * rubro y horarios). Son dos registros distintos y el alta puede quedar a medio
 * camino: el usuario cree que es mayorista, pero la API le rechaza publicar
 * productos porque no hay comercio al que asociarlos.
 *
 * El cálculo vive en PerfilContext, que es quien tiene los perfiles y los
 * comercios; acá solo se expone con un nombre que dice para qué se usa.
 *
 * @returns {{ tiposFaltantes: string[], faltaAlguna: boolean, loading: boolean }}
 */
export const useFichaComercial = () => {
  const { tiposSinFicha, loading, loadingComercios } = usePerfilActivo();

  return {
    tiposFaltantes: tiposSinFicha,
    faltaAlguna: tiposSinFicha.length > 0,
    loading: loading || loadingComercios,
  };
};

export default useFichaComercial;
