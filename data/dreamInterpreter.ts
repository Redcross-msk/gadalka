export interface DreamSymbol {
  keyword: string;
  title: string;
  interpretation: string;
}

export interface DreamInterpretation {
  symbols: DreamSymbol[];
  summary: string;
  disclaimer: string;
}

/** ~50 распространённых символов (народные + символические трактовки). */
export const dreamSymbols: DreamSymbol[] = [
  { keyword: "улица", title: "Поиск направления", interpretation: "Образ улицы часто связывают с текущим жизненным путем и выбором направления." },
  { keyword: "дорога", title: "Движение", interpretation: "Может символизировать постепенное развитие событий." },
  { keyword: "лес", title: "Неизвестность", interpretation: "Нередко трактуется как встреча с неизученными сторонами ситуации." },
  { keyword: "море", title: "Эмоции", interpretation: "Часто связывается с внутренними переживаниями." },
  { keyword: "река", title: "Перемены", interpretation: "Символ течения времени и изменений." },
  { keyword: "дождь", title: "Очищение", interpretation: "Иногда рассматривается как освобождение от накопленного напряжения." },
  { keyword: "снег", title: "Пауза", interpretation: "Может отражать период спокойствия или замедления." },
  { keyword: "ночь", title: "Неясность", interpretation: "Образ неизвестного и скрытых вопросов." },
  { keyword: "вечер", title: "Подведение итогов", interpretation: "Часто ассоциируется с завершением этапа." },
  { keyword: "утро", title: "Начало", interpretation: "Символ нового цикла." },
  { keyword: "дом", title: "Безопасность", interpretation: "Отражает личное пространство и привычный уклад." },
  { keyword: "монастырь", title: "Размышления", interpretation: "Может символизировать поиск внутренней тишины." },
  { keyword: "церковь", title: "Ценности", interpretation: "Образ обращения к убеждениям." },
  { keyword: "мост", title: "Переход", interpretation: "Связь между двумя этапами." },
  { keyword: "поезд", title: "Изменение курса", interpretation: "Движение по заранее заданному пути." },
  { keyword: "самолет", title: "Перспектива", interpretation: "Желание увидеть ситуацию шире." },
  { keyword: "машина", title: "Контроль", interpretation: "Отражает ощущение управления происходящим." },
  { keyword: "падаю", title: "Потеря опоры", interpretation: "Распространенный символ тревоги или неопределенности." },
  { keyword: "лечу", title: "Свобода", interpretation: "Может отражать чувство легкости." },
  { keyword: "бегу", title: "Поиск выхода", interpretation: "Связан с активным переживанием событий." },
  { keyword: "страшно", title: "Тревога", interpretation: "Часто отражает эмоциональное напряжение." },
  { keyword: "преследуют", title: "Избегание", interpretation: "Может символизировать нерешенный вопрос." },
  { keyword: "зубы", title: "Перемены", interpretation: "В народных сонниках часто связываются с изменениями и переживаниями." },
  { keyword: "без зубов", title: "Уязвимость", interpretation: "Нередко трактуется как ощущение потери уверенности." },
  { keyword: "кровь", title: "Сильные эмоции", interpretation: "Образ интенсивных переживаний." },
  { keyword: "огонь", title: "Преобразование", interpretation: "Символ энергии и изменений." },
  { keyword: "вода", title: "Чувства", interpretation: "Эмоциональная сфера." },
  { keyword: "ребенок", title: "Новый этап", interpretation: "Зарождение идеи или проекта." },
  { keyword: "животное", title: "Инстинкты", interpretation: "Внимание к естественным реакциям." },
  { keyword: "кот", title: "Независимость", interpretation: "Интуиция и личные границы." },
  { keyword: "собака", title: "Поддержка", interpretation: "Доверие и верность." },
  { keyword: "волк", title: "Самостоятельность", interpretation: "Осторожность и сила." },
  { keyword: "змея", title: "Мудрость", interpretation: "Либо скрытые обстоятельства в зависимости от контекста." },
  { keyword: "птица", title: "Весть", interpretation: "Новые идеи или известия." },
  { keyword: "ключ", title: "Решение", interpretation: "Поиск ответа." },
  { keyword: "дверь", title: "Возможность", interpretation: "Переход к новому." },
  { keyword: "окно", title: "Новый взгляд", interpretation: "Изменение перспективы." },
  { keyword: "деньги", title: "Ресурсы", interpretation: "Не только материальные, но и внутренние." },
  { keyword: "монеты", title: "Практичность", interpretation: "Внимание к повседневным вопросам." },
  { keyword: "кольцо", title: "Связь", interpretation: "Договоренности и отношения." },
  { keyword: "свадьба", title: "Союз", interpretation: "Объединение двух направлений." },
  { keyword: "смерть", title: "Трансформация", interpretation: "В символическом толковании чаще означает завершение этапа." },
  { keyword: "кладбище", title: "Память", interpretation: "Прошлый опыт." },
  { keyword: "гора", title: "Цель", interpretation: "Преодоление пути." },
  { keyword: "лифт", title: "Быстрые изменения", interpretation: "Изменение положения." },
  { keyword: "лестница", title: "Постепенное развитие", interpretation: "Рост или спуск." },
  { keyword: "телефон", title: "Контакт", interpretation: "Необходимость общения." },
  { keyword: "зеркало", title: "Самопознание", interpretation: "Взгляд на себя." },
  { keyword: "часы", title: "Время", interpretation: "Осознание сроков." },
  { keyword: "золото", title: "Ценность", interpretation: "Значимые ресурсы." },
];

function normalizeDreamText(text: string): string {
  return text.toLowerCase().replace(/ё/g, "е");
}

/**
 * Толкование сна по тексту описания.
 * Ищет ключевые слова из базы символов и собирает summary.
 */
export function interpretDream(text: string): DreamInterpretation {
  const lower = normalizeDreamText(text);
  const matches = dreamSymbols.filter((s) => lower.includes(normalizeDreamText(s.keyword)));

  if (matches.length === 0) {
    return {
      symbols: [],
      summary:
        "В описании сна не найдено известных символов. Его можно рассматривать как сочетание личных впечатлений и переживаний.",
      disclaimer: "Толкование носит исключительно развлекательный и символический характер.",
    };
  }

  const summary =
    "Во сне выделяются следующие символические темы: " +
    matches.map((m) => m.title.toLowerCase()).join(", ") +
    ". Их сочетание можно рассматривать как отражение внутренних переживаний, воспоминаний или эмоционального состояния, а не как предсказание будущего.";

  return {
    symbols: matches,
    summary,
    disclaimer: "Толкование носит исключительно развлекательный и символический характер.",
  };
}

export function formatDreamInterpretation(result: DreamInterpretation): string {
  const parts = [result.summary];

  if (result.symbols.length) {
    parts.push("");
    for (const symbol of result.symbols) {
      parts.push(`«${symbol.keyword}» — ${symbol.title}: ${symbol.interpretation}`);
    }
  }

  parts.push("", result.disclaimer);
  return parts.join("\n");
}
