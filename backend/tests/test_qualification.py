import unittest

from backend.services.qualification import (
    DEFAULT_MESSAGE_THRESHOLD,
    QualificationService,
)


class QualificationServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.service = QualificationService()

    def test_qualifies_when_all_core_fields_are_present(self):
        result = self.service.evaluate_qualification(
            conversation={"messages_json": [{"from": "prospect", "content": "Bonjour"}], "status": "active"},
            prospect_data={
                "project_type": "Ravalement facade",
                "surface": "120m2",
                "location": "Bruz",
            },
        )

        self.assertTrue(result["should_qualify"])
        self.assertEqual(result["score"], "warm")
        self.assertEqual(result["missing_fields"], [])
        self.assertIn("Tous les champs clés", result["reason"])

    def test_qualifies_after_threshold_with_partial_data(self):
        result = self.service.evaluate_qualification(
            conversation={
                "messages_json": [{"from": "prospect", "content": "Message"}] * DEFAULT_MESSAGE_THRESHOLD,
                "status": "active",
            },
            prospect_data={
                "project_type": "Peinture interieure",
                "surface": None,
                "location": None,
            },
        )

        self.assertTrue(result["should_qualify"])
        self.assertEqual(result["score"], "warm")
        self.assertEqual(result["missing_fields"], ["surface", "location"])
        self.assertIn(f"{DEFAULT_MESSAGE_THRESHOLD} messages", result["reason"])

    def test_does_not_requalify_conversation_already_qualified(self):
        result = self.service.evaluate_qualification(
            conversation={
                "messages_json": [{"from": "prospect", "content": "Message"}] * 10,
                "status": "qualified",
            },
            prospect_data={
                "project_type": "Peinture interieure",
                "surface": "75m2",
                "location": "Rennes",
            },
        )

        self.assertFalse(result["should_qualify"])
        self.assertEqual(result["score"], "warm")

    def test_scores_hot_when_budget_and_urgent_delay_are_present(self):
        result = self.service.evaluate_qualification(
            conversation={"messages_json": [], "status": "active"},
            prospect_data={
                "project_type": "Facade",
                "surface": "120m2",
                "location": "Bruz",
                "budget": "5000-6000 EUR",
                "delay": "urgent sous 1 mois",
            },
        )

        self.assertEqual(result["score"], "hot")

    def test_merge_prospect_data_ignores_empty_values(self):
        merged = self.service.merge_prospect_data(
            existing={
                "name": "Marie Dupont",
                "email": "marie@example.com",
                "project_type": "Peinture",
            },
            new_data={
                "name": "",
                "email": None,
                "phone": "0601020304",
                "project_type": "null",
            },
        )

        self.assertEqual(merged["name"], "Marie Dupont")
        self.assertEqual(merged["email"], "marie@example.com")
        self.assertEqual(merged["phone"], "0601020304")
        self.assertEqual(merged["project_type"], "Peinture")

    def test_has_contact_info_accepts_name_phone_or_email(self):
        self.assertTrue(self.service.has_contact_info({"name": "Paul"}))
        self.assertTrue(self.service.has_contact_info({"phone": "0601020304"}))
        self.assertTrue(self.service.has_contact_info({"email": "paul@example.com"}))
        self.assertFalse(self.service.has_contact_info({}))


if __name__ == "__main__":
    unittest.main()
