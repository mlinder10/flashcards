//
//  SavedPage.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/3/25.
//

import SwiftUI

struct SavedPage: View {
    @EnvironmentObject private var cStore: CardStore
    
    var body: some View {
        NavigationStack {
            Group {
                if cStore.cards.isEmpty { empty }
                else { grid }
            }
            .navigationTitle("Saved Cards")
            .toolbar {
                Button { saveCSV(cStore.cards.toCsv()) } label: {
                    Text("Export CSV")
                }
            }
        }
    }
    
    var empty: some View {
        VStack {
            Text("No saved flashcards")
                .fontWeight(.semibold)
        }
    }
    
    var grid: some View {
        ScrollView {
            LazyVGrid(columns: Array(repeating: GridItem(), count: 2)) {
                ForEach(cStore.cards) { card in
                    FlashcardView(card: card)
                }
            }
        }
    }
}
