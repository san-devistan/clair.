# Clair FEC Dashboard

Clair turns French FEC files into dashboard views for business owners. This
context captures the accounting language used to distinguish financial
categories from third-party relationships.

## Language

**Compte général FEC**:
A Plan Comptable Général account from a FEC entry that carries an accounting
classification.
_Avoid_: account, customer account

**Compte auxiliaire**:
A third-party sub-account attached to a FEC entry, usually identifying a client
or supplier.
_Avoid_: general account, poste

**Poste de revenus**:
A revenue-bearing general account, usually from class 7, ranked by net amount.
_Avoid_: top client, revenu account, detail row

**Détail des revenus**:
A revenue analysis row that combines a revenue general account with its
auxiliary account when one exists.
_Avoid_: top client, poste de revenus

**Détail des charges**:
An expense analysis row that combines an expense general account with its
auxiliary account when one exists.
_Avoid_: top fournisseur, poste de charges

**Autres postes**:
The grouped long tail of composition categories or detail rows that are
individually too small for the chart.
_Avoid_: hidden postes, ignored accounts

**Client**:
A customer identified through client auxiliary accounts, not through revenue
accounts.
_Avoid_: poste de revenus, compte de revenus

**Action à mener**:
A data-triggered recommendation raised from the FEC analysis because a financial
threshold, concentration, delay, anomaly, trend, or significant amount requires
attention.
_Avoid_: conseil général, astuce, piste statique, question de pilotage

## Relationships

- A **Poste de revenus** is derived from exactly one **Compte général FEC**.
- A **Détail des revenus** or **Détail des charges** is derived from one
  **Compte général FEC** and may include one **Compte auxiliaire**.
- When the revenue or expense line itself has no **Compte auxiliaire**, the
  detail inherits the customer or supplier auxiliary account carried by another
  line in the same accounting entry.
- A **Client** is identified through one or more **Compte auxiliaire** entries.
- A revenue dashboard may show both **Détail des revenus** and **Clients**, but
  they answer different questions.
- A composition view groups many **Comptes généraux FEC** into business
  categories; a detail view ranks individual account/auxiliary combinations.
- Composition and detail bar charts group every individual item below 5% of the
  total into **Autres postes**.
- Detail tables still list all non-zero detail rows.
- Negative detail rows are excluded from composition bars but shown in detail
  tables as anomalies to review.
- An **Action à mener** belongs to exactly one dashboard category and is shown
  in the central actions view, not as generic guidance inside category pages.
- Category pages may signal that **Actions à mener** exist for their domain, but
  the recommendation content remains centralized in the actions view.
- **Actions à mener** map to dashboard pages by category: charges to Charges,
  clients to Clients, fournisseurs to Fournisseurs, tresorerie to Trésorerie,
  ventes to Revenus, and marge to Vue d'ensemble.
- Positive **Actions à mener** remain visible in the central actions view but do
  not trigger category-page action indicators.

## Example Dialogue

> **Dev:** "Should Top revenus list the biggest clients?"
> **Domain expert:** "No. Top revenus should show revenue detail by account, and
> include auxiliary detail when present; client concentration belongs to the
> clients view."

## Flagged Ambiguities

- "account" was used to mean a **Compte général FEC** rather than a customer or
  **Compte auxiliaire**. Resolved: revenue and charge detail rows combine the
  general account with auxiliary detail when present.
- "poste" was too narrow for the requested detail view. Resolved: revenue and
  charge detail sections may include **Compte auxiliaire** data without becoming
  client or supplier dashboards.
- "conseil" was used for both generic education and data-triggered
  recommendations. Resolved: only **Actions à mener** should be surfaced as
  recommendations in the dashboard experience.
