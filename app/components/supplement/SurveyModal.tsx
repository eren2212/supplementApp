import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import surveyQuestions from "@/app/data/questions";
import { ISurveyQuestions } from "@/app/data/questions";
import { supplementFeatures } from "@/app/data/supplementFeatures";
import { IQuestions } from "@/types/questionType";

interface SurveyModalProps {
  isOpen: boolean;
  closeModal: () => void;
  addToCart: (supplements: string[]) => void;
}

// Select 15 most important questions from the survey
const getSelectedQuestions = () => {
  // Temel sorular - farklı kategorilerden dengeli bir dağılım sağlamak için
  const selectedQuestionIds = [
    // Genel sağlık ve temel besleme soruları (3)
    1, 2, 3,

    // Uyku ve enerji soruları (3)
    10, 11, 12,

    // Fiziksel sağlık soruları (3)
    15, 17, 19,

    // Mental sağlık soruları (2)
    21, 23,

    // Sağlık geçmişi soruları (1)
    9,

    // Cinsiyete özel sorular (2)
    // Bu soruların içeriğine bağlı olarak erkek/kadın sağlığı sorularını da dahil edebiliriz
    6, 20,

    // Birincil sağlık hedefi (1 - çok önemli)
    24,
  ];

  const commonQuestions =
    surveyQuestions.find((cat) => cat.category === "common")?.questions || [];

  return commonQuestions
    .filter((question) => selectedQuestionIds.includes(question.id))
    .sort(
      (a, b) =>
        selectedQuestionIds.indexOf(a.id) - selectedQuestionIds.indexOf(b.id)
    );
};

const SurveyModal = ({ isOpen, closeModal, addToCart }: SurveyModalProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [suggestedSupplements, setSuggestedSupplements] = useState<string[]>(
    []
  );
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedSupplements, setSelectedSupplements] = useState<
    Record<string, boolean>
  >({});
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Get filtered questions
  const selectedQuestions = getSelectedQuestions();

  const handleAnswer = (questionId: number, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Process answers to find supplements
      findSuggestedSupplements();
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const findSuggestedSupplements = () => {
    // Supplement puanlama sistemi
    const supplementScores: Record<
      string,
      { score: number; categories: Set<string> }
    > = {};

    // Kategori önceliklendirme için puan katsayıları
    const categoryMultipliers: Record<string, number> = {
      beyin: 1.2, // Beyin sağlığı yüksek öncelik (x1.2 puan)
      kalp: 1.2, // Kalp sağlığı yüksek öncelik (x1.2 puan)
      uyku: 1.1, // Uyku sağlığı orta-yüksek öncelik (x1.1 puan)
      eklem: 1.1, // Eklem sağlığı orta-yüksek öncelik (x1.1 puan)
      bağışıklık: 1.0, // Bağışıklık orta öncelik (x1.0 puan)
      enerji: 1.0, // Enerji orta öncelik (x1.0 puan)
      sindirim: 1.0, // Sindirim orta öncelik (x1.0 puan)
      deri: 0.9, // Deri sağlığı orta-düşük öncelik (x0.9 puan)
      göz: 0.9, // Göz sağlığı orta-düşük öncelik (x0.9 puan)
      saç: 0.9, // Saç sağlığı orta-düşük öncelik (x0.9 puan)
      "erkek sağlığı": 1.0, // Erkek sağlığı orta öncelik (x1.0 puan)
      "kadın sağlığı": 1.0, // Kadın sağlığı orta öncelik (x1.0 puan)
      common: 0.8, // Genel sorular için düşük katsayı (x0.8 puan)
    };

    // Tüm kategori sorularını işle
    for (const categoryObj of surveyQuestions) {
      const category = categoryObj.category;
      const categoryQuestions = categoryObj.questions;
      const categoryMultiplier = categoryMultipliers[category] || 1.0;

      // Her soruyu işle
      for (const question of categoryQuestions) {
        const questionId = question.id;
        const answer = answers[questionId];

        // Kullanıcı bu soruya cevap vermemişse, atla
        if (!answer) continue;

        // Soru için belirli puan ağırlığı
        // Hedefe yönelik sorular (aim) daha önemli - 15 puan
        // Normal sorular - 10 puan
        const questionWeight = question.type === "aim" ? 15 : 10;

        // Cevaba göre puanlama
        if (question.suggestible_supplement) {
          question.suggestible_supplement.forEach(
            (suggestion: { option: string; supplement: string }) => {
              // Eğer supplementin puanı yoksa başlat
              if (!supplementScores[suggestion.supplement]) {
                supplementScores[suggestion.supplement] = {
                  score: 0,
                  categories: new Set<string>(),
                };
              }

              // Kategori ekleme
              supplementScores[suggestion.supplement].categories.add(category);

              // Tek seçenek sorular için (radio buttons)
              // Örnek: "Uyku kaliteniz nasıl?" sorusuna "Berbat" cevabı seçildiyse
              // ve "Berbat" cevabı Magnezyum Gece Pudrasını öneriyorsa puan eklenir
              if (
                typeof answer === "string" &&
                answer.toLowerCase().includes(suggestion.option.toLowerCase())
              ) {
                // Puan ekleme: Soru ağırlığı * Kategori katsayısı
                // Örneğin: 10 * 1.1 = 11 puan (uyku kategorisi katsayısı 1.1)
                supplementScores[suggestion.supplement].score +=
                  questionWeight * categoryMultiplier;
              }
              // Çoklu seçenek sorular için (checkboxes)
              // Örnek: "Hangi sağlık sorunlarınız var?" sorusuna "Uyku problemi" ve "Stres" seçilmişse
              // her biri için ayrı puanlama yapılır
              else if (
                Array.isArray(answer) &&
                answer.some((a) =>
                  a.toLowerCase().includes(suggestion.option.toLowerCase())
                )
              ) {
                // Her eşleşme için puan ekleme
                supplementScores[suggestion.supplement].score +=
                  questionWeight * categoryMultiplier;
              }
            }
          );
        }
      }
    }

    // Kullanıcının birincil sağlık hedefi (soru 24)
    // Bu soru, kullanıcının en çok önem verdiği sağlık alanını belirler
    const primaryGoal = answers[24];
    if (primaryGoal && typeof primaryGoal === "string") {
      const targetCategory = primaryGoal.toLowerCase();

      // Birincil hedefe göre ek puanlama
      Object.keys(supplementScores).forEach((supplement) => {
        if (supplementScores[supplement].categories.has(targetCategory)) {
          // Hedef kategorideki supplementlere ek puan (20 puan bonus)
          // Örnek: Kullanıcı "Beyin" seçtiyse, beyin kategorisindeki supplementler +20 puan alır
          supplementScores[supplement].score += 20;
        }
      });
    }

    // Puanları azalan şekilde sırala ve en yüksek puanlı supplementleri al
    const sortedSupplements = Object.entries(supplementScores)
      .sort((a, b) => b[1].score - a[1].score)
      .filter(([name]) => supplementFeatures.some((s) => s.name === name))
      .map(([name]) => name);

    // En yüksek puanlı 3 supplement'i öner
    const finalSuggestions = sortedSupplements.slice(0, 3);

    // Eğer 3'ten az supplement öneri varsa, kullanıcının birincil hedefine göre ek öneriler ekle
    if (
      finalSuggestions.length < 3 &&
      primaryGoal &&
      typeof primaryGoal === "string"
    ) {
      const targetCategory = primaryGoal.toLowerCase();
      const categoryQuestions =
        surveyQuestions.find(
          (cat) => cat.category.toLowerCase() === targetCategory
        )?.questions || [];

      // Hedef kategorideki tavsiyelerden ek supplement ekle
      for (const question of categoryQuestions) {
        if (finalSuggestions.length >= 3) break;

        if (
          question.suggestible_supplement &&
          question.suggestible_supplement.length > 0
        ) {
          for (const suggestion of question.suggestible_supplement) {
            const supplement = suggestion.supplement;
            if (
              !finalSuggestions.includes(supplement) &&
              supplementFeatures.some((s) => s.name === supplement)
            ) {
              finalSuggestions.push(supplement);
              if (finalSuggestions.length >= 3) break;
            }
          }
        }
      }
    }

    // Hala 3'ten az supplement varsa, genel popüler supplementlerden ekle
    if (finalSuggestions.length < 3) {
      const commonSupplements = [
        "Vitamin D",
        "Magnezyum",
        "Omega-3",
        "B12 Vitamini",
        "Çinko",
        "Ashwagandha",
      ];

      for (const supp of commonSupplements) {
        if (finalSuggestions.length >= 3) break;
        if (
          !finalSuggestions.includes(supp) &&
          supplementFeatures.some((s) => s.name === supp)
        ) {
          finalSuggestions.push(supp);
        }
      }
    }

    setSuggestedSupplements(finalSuggestions);

    // Tüm supplementleri seçili olarak işaretle
    const initialSelectedState: Record<string, boolean> = {};
    finalSuggestions.forEach((supp) => {
      initialSelectedState[supp] = true;
    });
    setSelectedSupplements(initialSelectedState);
  };

  const handleSupplementToggle = (supplement: string) => {
    setSelectedSupplements((prev) => ({
      ...prev,
      [supplement]: !prev[supplement],
    }));
  };

  const handleAddToCartClick = () => {
    // Show confirmation before adding to cart
    setShowConfirmation(true);
  };

  const confirmAddToCart = () => {
    // Filter only selected supplements
    const supplementsToAdd = Object.entries(selectedSupplements)
      .filter(([_, isSelected]) => isSelected)
      .map(([supplement]) => supplement);

    addToCart(supplementsToAdd);
    closeModal();
  };

  const resetSurvey = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSuggestedSupplements([]);
    setSelectedSupplements({});
    setShowResults(false);
    setShowConfirmation(false);
  };

  const renderQuestion = (question: IQuestions) => {
    switch (question.type) {
      case "single choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.question}</h3>
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${idx}`}
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswer(question.id, option)}
                    className="mr-2"
                  />
                  <label htmlFor={`option-${idx}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );
      case "multiple choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.question}</h3>
            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const selectedOptions =
                  (answers[question.id] as string[]) || [];
                return (
                  <div key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`option-${idx}`}
                      name={`question-${question.id}`}
                      value={option}
                      checked={selectedOptions.includes(option)}
                      onChange={(e) => {
                        const currentAnswers = [...selectedOptions];
                        if (e.target.checked) {
                          currentAnswers.push(option);
                        } else {
                          const index = currentAnswers.indexOf(option);
                          if (index > -1) {
                            currentAnswers.splice(index, 1);
                          }
                        }
                        handleAnswer(question.id, currentAnswers);
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`option-${idx}`}>{option}</label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "aim":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.question}</h3>
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${idx}`}
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswer(question.id, option)}
                    className="mr-2"
                  />
                  <label htmlFor={`option-${idx}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center bg-blue-50 p-4 rounded-lg">
        <p className="text-md font-medium text-blue-800 mb-2">
          Anket Değerlendirme Sonucu
        </p>
        <p className="text-sm text-gray-600">
          Verdiğiniz yanıtlar kapsamlı bir şekilde değerlendirildi. Sağlık
          profilinize en uygun takviyeler aşağıda listelenmiştir.
        </p>
      </div>

      <div className="space-y-4">
        {suggestedSupplements.length > 0 ? (
          <>
            {suggestedSupplements.map((supplement, idx) => {
              const supplementInfo = supplementFeatures.find(
                (s) => s.name === supplement
              );
              return (
                <div
                  key={idx}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`supplement-${idx}`}
                      checked={selectedSupplements[supplement] || false}
                      onChange={() => handleSupplementToggle(supplement)}
                      className="mr-2 h-5 w-5 text-blue-600"
                    />
                    <label
                      htmlFor={`supplement-${idx}`}
                      className="font-medium text-lg cursor-pointer text-blue-700"
                    >
                      {supplement}
                    </label>
                  </div>
                  <ul className="mt-3 pl-5 list-disc text-sm text-gray-600">
                    {supplementInfo?.features.map((feature, fidx) => (
                      <li key={fidx} className="mb-1">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-3">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">
                  Öneri sistemi nasıl çalışır?
                </span>{" "}
                Cevaplarınız bir puanlama algoritması ile değerlendirilir:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>
                  Her soru kategorize edilmiştir (beyin, kalp, uyku, sindirim
                  vb.)
                </li>
                <li>
                  Cevaplarınız, sağlık profilinize uygun takviyelere puan ekler
                </li>
                <li>
                  Birincil sağlık hedefiniz, ilgili kategorideki takviyelere ek
                  puan kazandırır
                </li>
                <li>En yüksek puanlı takviyeler size önerilir</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 italic px-2">
              Bu öneriler, anket cevaplarınıza göre kişiselleştirilmiş bir
              algoritma kullanılarak oluşturulmuştur. Sağlık profilinize en
              uygun olduğunu düşündüğümüz takviyeleri seçmenizi öneriyoruz.
            </p>
          </>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-yellow-700">
              Üzgünüz, cevaplarınıza göre uygun takviye bulunamadı.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Lütfen anketi tekrar deneyin veya daha fazla soru yanıtlayın.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="button"
          onClick={handleAddToCartClick}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Seçilen Takviyeleri Sepete Ekle
        </button>

        <button
          type="button"
          onClick={resetSurvey}
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-200"
        >
          Anketi Yeniden Başlat
        </button>

        <button
          type="button"
          onClick={closeModal}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
        >
          Kapat
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <p className="text-lg font-medium text-center">
        Seçilen takviyeleri sepete eklemek istiyor musunuz?
      </p>

      <div className="space-y-2">
        {Object.entries(selectedSupplements)
          .filter(([_, isSelected]) => isSelected)
          .map(([supplement], idx) => (
            <div key={idx} className="p-2 bg-blue-50 rounded">
              {supplement}
            </div>
          ))}
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={confirmAddToCart}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Evet, Sepete Ekle
        </button>

        <button
          type="button"
          onClick={() => setShowConfirmation(false)}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Hayır, Geri Dön
        </button>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {showConfirmation
                    ? "Sepete Ekle"
                    : showResults
                    ? "Önerilen Takviyeler"
                    : "Sağlık Anketi"}
                </Dialog.Title>

                <div className="mt-4">
                  {showConfirmation ? (
                    renderConfirmation()
                  ) : !showResults ? (
                    <>
                      {selectedQuestions.length > 0 &&
                        renderQuestion(selectedQuestions[currentQuestionIndex])}

                      <div className="mt-6 flex justify-between">
                        <button
                          type="button"
                          onClick={prevQuestion}
                          disabled={currentQuestionIndex === 0}
                          className={`px-4 py-2 text-sm font-medium rounded-md 
                            ${
                              currentQuestionIndex === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                            }`}
                        >
                          Önceki
                        </button>

                        <button
                          type="button"
                          onClick={nextQuestion}
                          disabled={
                            !answers[
                              selectedQuestions[currentQuestionIndex]?.id
                            ]
                          }
                          className={`px-4 py-2 text-sm font-medium rounded-md 
                            ${
                              !answers[
                                selectedQuestions[currentQuestionIndex]?.id
                              ]
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                          {currentQuestionIndex < selectedQuestions.length - 1
                            ? "Sonraki"
                            : "Sonuçları Gör"}
                        </button>
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        Soru {currentQuestionIndex + 1} /{" "}
                        {selectedQuestions.length}
                      </div>
                    </>
                  ) : (
                    renderResults()
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SurveyModal;
