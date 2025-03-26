flowchart TD
%% Pages
Home[Home Page]
Question[Question Page]
Summary[Summary Page]

    %% Services and Storage
    QuestionService[Question Service]
    LLMService[LLM Service]
    SessionStorage[(Session Storage)]

    %% Components
    ScrollingTopics[Scrolling Topics]
    LoadingModal[Loading Modal]
    ConfirmModal[Confirmation Modal]

    %% Home Page Flow
    Home --> |Select Topic| QuestionService
    QuestionService --> |Generate Questions| LLMService
    LLMService --> |Questions Generated| SessionStorage
    SessionStorage --> |Store Questions| Question

    %% Question Page Flow
    Question --> |Select Answer| SessionStorage
    Question --> |Back Button| ConfirmModal
    ConfirmModal --> |Cancel| Question
    ConfirmModal --> |Confirm| Home
    Question --> |All Questions Done| Summary

    %% Summary Page Flow
    Summary --> |View Results| SessionStorage
    Summary --> |Start New Round| Home

    %% Storage Items
    subgraph Session Storage
        QuizQuestions[quiz_questions]
        ShuffledQuestions[quiz_shuffled_questions]
        QuizAnswers[quiz_answers]
        QuizComplete[quiz_complete]
        QuestionsTotal[quiz_questions_total]
    end

    %% Component Relationships
    Home --> ScrollingTopics
    QuestionService --> LoadingModal

    %% State Management Notes
    classDef state fill:#f9f,stroke:#333,stroke-width:2px
    class SessionStorage state

    %% Page Notes
    classDef page fill:#bbf,stroke:#333,stroke-width:2px
    class Home,Question,Summary page

    %% Service Notes
    classDef service fill:#bfb,stroke:#333,stroke-width:2px
    class QuestionService,LLMService service

    %% Component Notes
    classDef component fill:#ddd,stroke:#333,stroke-width:2px
    class ScrollingTopics,LoadingModal,ConfirmModal component
