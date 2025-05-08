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
  const commonQuestions =
    surveyQuestions.find((cat) => cat.category === "common")?.questions || [];

  // Question IDs we want to include - selected the most relevant 15 questions
  const selectedQuestionIds = [
    1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 15, 17, 19, 21, 24,
  ];

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
    const suggested: string[] = [];
    const allQuestions =
      surveyQuestions.find((cat) => cat.category === "common")?.questions || [];

    // Process all answers to find suggested supplements
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = allQuestions.find((q) => q.id === parseInt(questionId));

      if (question?.suggestible_supplement) {
        question.suggestible_supplement.forEach(
          (suggestion: { option: string; supplement: string }) => {
            // For single choice questions
            if (
              typeof answer === "string" &&
              answer.toLowerCase().includes(suggestion.option.toLowerCase())
            ) {
              if (!suggested.includes(suggestion.supplement)) {
                suggested.push(suggestion.supplement);
              }
            }
            // For multiple choice questions
            else if (
              Array.isArray(answer) &&
              answer.some((a) =>
                a.toLowerCase().includes(suggestion.option.toLowerCase())
              )
            ) {
              if (!suggested.includes(suggestion.supplement)) {
                suggested.push(suggestion.supplement);
              }
            }
          }
        );
      }
    });

    // Get user's primary health goal (question 24)
    const primaryGoal = answers[24];
    if (primaryGoal && typeof primaryGoal === "string") {
      // Find category based on goal
      const targetCategory = primaryGoal.toLowerCase();
      const categoryQuestions =
        surveyQuestions.find(
          (cat) => cat.category.toLowerCase() === targetCategory
        )?.questions || [];

      // Process goal-specific suggestions
      if (categoryQuestions.length > 0) {
        // Get category-specific recommendations
        categoryQuestions.forEach((question) => {
          if (
            question.suggestible_supplement &&
            question.suggestible_supplement.length > 0
          ) {
            // Just take the first supplement from each question's suggestions
            const supplement = question.suggestible_supplement[0].supplement;
            if (!suggested.includes(supplement)) {
              suggested.push(supplement);
            }
          }
        });
      }
    }

    // Limit to 3 supplements and check if they exist in supplementFeatures
    const validSupplements = suggested.filter((name) =>
      supplementFeatures.some((s) => s.name === name)
    );

    const finalSuggestions = validSupplements.slice(0, 3);

    // If we have less than 3 valid supplements, add some common ones to reach 3
    if (finalSuggestions.length < 3) {
      const commonSupplements = [
        "Vitamin D",
        "Magnezyum",
        "Omega-3",
        "B12 Vitamini",
        "Çinko",
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

    // Initialize all supplements as selected
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
      <p className="text-sm text-gray-500">
        Cevaplarınıza göre, size aşağıdaki takviyeleri öneriyoruz:
      </p>

      <div className="space-y-4">
        {suggestedSupplements.length > 0 ? (
          suggestedSupplements.map((supplement, idx) => {
            const supplementInfo = supplementFeatures.find(
              (s) => s.name === supplement
            );
            return (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`supplement-${idx}`}
                    checked={selectedSupplements[supplement] || false}
                    onChange={() => handleSupplementToggle(supplement)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`supplement-${idx}`}
                    className="font-medium cursor-pointer"
                  >
                    {supplement}
                  </label>
                </div>
                <ul className="mt-2 pl-5 list-disc text-sm text-gray-600">
                  {supplementInfo?.features.map((feature, fidx) => (
                    <li key={fidx}>{feature}</li>
                  ))}
                </ul>
              </div>
            );
          })
        ) : (
          <p>Üzgünüz, cevaplarınıza göre uygun takviye bulunamadı.</p>
        )}
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="button"
          onClick={handleAddToCartClick}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Seçilen Takviyeleri Sepete Ekle
        </button>

        <button
          type="button"
          onClick={resetSurvey}
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
        >
          Anketi Yeniden Başlat
        </button>

        <button
          type="button"
          onClick={closeModal}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
