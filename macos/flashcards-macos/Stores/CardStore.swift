//
//  CardStore.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/3/25.
//

import SwiftUI

final class CardStore: ObservableObject {
    @Published var cards: [Flashcard]
    
    init() {
        let cards: [Flashcard]? = try? StorageManager.shared.read(.flashcards)
        self.cards = cards ?? []
    }
    
    func saveCards(_ cards: [Flashcard]) throws {
        let original = self.cards
        self.cards.append(contentsOf: cards)
        do {
            try StorageManager.shared.write(.flashcards, self.cards)
        } catch {
            print(error.localizedDescription)
            self.cards = original
            throw error
        }
    }
}
