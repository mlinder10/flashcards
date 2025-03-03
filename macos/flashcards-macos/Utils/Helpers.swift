//
//  Helpers.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/3/25.
//

import AppKit

func saveCSV(_ data: String, title: String = "untitled.csv") {
    let savePanel = NSSavePanel()
    savePanel.nameFieldStringValue = title
    savePanel.begin { response in
        if response == .OK, let url = savePanel.url {
            do {
                try data.write(to: url, atomically: true, encoding: .utf8)
                print("File saved to: \(url.path)")
            } catch {
                print("Failed to save file: \(error.localizedDescription)")
            }
        }
    }
}
