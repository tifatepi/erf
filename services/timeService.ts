
/**
 * Serviço de Sincronização de Hora Oficial
 * Sincroniza o relógio do sistema com servidores de hora (via WorldTimeAPI)
 * para evitar fraudes ou erros por relógio local incorreto.
 */

let clockOffset = 0; // Diferença em milissegundos entre o local e o servidor
let isSynced = false;

export const timeService = {
  /**
   * Sincroniza com o servidor de Brasília
   */
  async sync() {
    try {
      // Usamos a WorldTimeAPI como ponte para os servidores NTP
      const response = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
      const data = await response.json();
      
      const serverTime = new Date(data.datetime).getTime();
      const localTime = Date.now();
      
      clockOffset = serverTime - localTime;
      isSynced = true;
      console.log(`[TimeService] Sincronizado. Desvio detectado: ${clockOffset}ms`);
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
   * Retorna a data no formato ISO YYYY-MM-DD
   */
  todayISO(): string {
    return this.now().toISOString().split('T')[0];
  },

  getIsSynced() {
    return isSynced;
  }
};
