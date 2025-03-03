//
//  GeneratePage.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/3/25.
//

import SwiftUI

struct GeneratePage: View {
    @State private var flashcards = NetworkRequest([Flashcard]())
    @State private var selected = [Flashcard]()
    @State private var university = "University of South Carolina"
    @State private var department = "Psychology"
    @State private var courseNumber = "PSYC 420"
    @State private var courseName = "Survey of Developmental Psychology"
    @State private var responseSize: ResponseSize = .small
    
    var body: some View {
        NavigationStack {
            Group {
                if flashcards.data.isEmpty {
                    if flashcards.loading { loading }
                    else if let error = flashcards.error { Text(error) }
                    else { input }
                }
                else { grid }
            }
            .navigationTitle("Generate Flashcards")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    if flashcards.data.isEmpty {
                        Button { request() } label: {
                            Text("Generate")
                        }
                        .buttonStyle(.borderedProminent)
                    } else {
                        Button { saveCSV(selected.toCsv()) } label: {
                            Text("Export CSV")
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                if !flashcards.data.isEmpty {
                    ToolbarItem(placement: .secondaryAction) {
                        Button { flashcards.data = [] } label: {
                            Label("Back", systemImage: "arrow.left")
                        }
                    }
                }
            }
        }
    }
    
    var input: some View {
        VStack {
            HStack {
                Text("University")
                TextField("University of South Carolina", text: $university)
            }
            HStack {
                Text("Department")
                TextField("Psychology", text: $department)
            }
            HStack {
                Text("Course Number")
                TextField("PSYC 420", text: $courseNumber)
            }
            HStack {
                Text("Course Name")
                TextField("Survey of Developmental Psychology", text: $courseName)
            }
            HStack {
                Picker("Response Size", selection: $responseSize) {
                    ForEach(ResponseSize.allCases) {
                        Text($0.label)
                            .tag($0)
                    }
                }
            }
        }
        .padding()
    }
    
    var loading: some View {
        VStack {
            Text("Loading...")
            ProgressView()
        }
    }
    
    var grid: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(), GridItem()], spacing: 16) {
                ForEach(flashcards.data) { card in
                    FlashcardView(card: card)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(
                                    selected.contains(where: { $0.id == card.id}) ? Color.accentColor : Color.secondary
                                )
                        )
                        .onTapGesture { selected.append(card) }
                }
            }
            .padding()
        }
    }
    
    func request() {
        Task {
            await flashcards.call {
                let prompt = buildPrompt(
                    university: university,
                    department: department,
                    courseNumber: courseNumber,
                    courseName: courseName
                )
                return try await LocalModelManager.shared.generate(prompt: prompt, tokenLimit: responseSize)
            }
        }
    }
}
