
/**
 * Serviço de Sincronização de Hora Oficial
 * Sincroniza o relógio do sistema com servidores de hora (via WorldTimeAPI)
 * configurado especificamente para Fortaleza-Ceará (America/Fortaleza).
 */

let clockOffset = 0; // Diferença em milissegundos entre o local e o servidor
let isSynced = false;

export const timeService = {
  /**
   * Sincroniza com o servidor de Fortaleza-CE
   */
  async sync() {
    try {
      // Sincronização direta com o fuso horário de Fortaleza
      const response = await fetch('https://worldtimeapi.org/api/timezone/America/Fortaleza');
      const data = await response.json();
      
      const serverTime = new Date(data.datetime).getTime();
      const localTime = Date.now();
      
      clockOffset = serverTime - localTime;
      isSynced = true;
      console.log(`[TimeService] Sincronizado com Fortaleza-CE. Desvio: ${clockOffset}ms`);
    } catch (error) {
      console.warn('[TimeService] Erro ao sincronizar hora. Usando relógio local como fallback.', error);
      clockOffset = 0;
    }
  },

  /**
   * Retorna um objeto Date corrigido
   */
  now(): Date {
    return new Date(Date.now() + clockOffset);
  },

  /**
   * Retorna a data no formato ISO YYYY-MM-DD (Data Local Corrigida)
   */
  todayISO(): string {
    const d = this.now();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getIsSynced() {
    return isSynced;
  }
};
