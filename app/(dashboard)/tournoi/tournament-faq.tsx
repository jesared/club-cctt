import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { tournamentRegistrationContent } from "@/lib/tournament-registration-content";

const linkClassName = "font-medium text-primary underline underline-offset-4";
const contactHref = "mailto:inscriptions-tournoi@cctt.fr";
const registrationsHref = "/user/inscriptions";

const questions = [
  {
    question: "Où trouver les dates, les horaires et les tarifs ?",
    answer: (
      <p>
        La page Tournoi indique les dates, le lieu et la date limite d’inscription.
        Consultez les <a href="#tableaux" className={linkClassName}>horaires et tarifs par tableau</a> avant de vous inscrire.
      </p>
    ),
  },
  {
    question: "Comment m’inscrire ?",
    answer: (
      <ol className="list-decimal space-y-2 ps-5">
        <li>
          Ouvrez <Link href={tournamentRegistrationContent.cta.href} className={linkClassName}>S’inscrire au tournoi</Link> et connectez-vous.
        </li>
        <li>Saisissez votre numéro de licence FFTT et vérifiez les informations du joueur récupérées par le formulaire.</li>
        <li>
          Choisissez les tableaux qui correspondent à votre classement et à votre catégorie.
          Vérifiez vos coordonnées et le récapitulatif, puis envoyez l’inscription.
        </li>
      </ol>
    ),
  },
  {
    question: "Puis-je inscrire plusieurs joueurs avec le même compte ?",
    answer: (
      <p>
        Oui. Remplissez un formulaire par joueur avec son numéro de licence.
        Après le premier envoi, cliquez sur <strong>Inscrire un autre joueur</strong>.
        Retrouvez tous vos joueurs dans <Link href={registrationsHref} className={linkClassName}>Mes inscriptions tournoi</Link>.
      </p>
    ),
  },
  {
    question: "Que faire si un tableau est complet ?",
    answer: (
      <p>
        Si le formulaire le propose, cochez l’option de liste d’attente pour ce tableau.
        L’e-mail récapitulatif précise les tableaux pour lesquels vous êtes en attente.
        Attendez que l’organisation vous confirme qu’une place s’est libérée.
      </p>
    ),
  },
  {
    question: "Comment savoir si mon inscription a bien été reçue ?",
    answer: (
      <p>
        Après l’envoi, le site affiche une confirmation. L’e-mail récapitulatif indique
        les tableaux enregistrés et ceux pour lesquels vous êtes en liste d’attente.
        Si le message manque, vérifiez vos courriers indésirables et consultez{" "}
        <Link href={registrationsHref} className={linkClassName}>Mes inscriptions tournoi</Link>.
      </p>
    ),
  },
  {
    question: "Où voir ce que je dois payer et comment régler ?",
    answer: (
      <p>
        Les <a href="#tableaux" className={linkClassName}>tarifs en ligne et sur place</a> sont affichés pour chaque tableau.
        Dans <Link href={registrationsHref} className={linkClassName}>Mes inscriptions tournoi</Link>,
        vérifiez le montant déjà réglé et le reste à payer, puis utilisez <strong>Payer en ligne</strong> si vous choisissez ce mode de règlement.
        Pour un paiement sur place, vérifiez auprès de l’organisation les moyens acceptés.
      </p>
    ),
  },
  {
    question: "Puis-je modifier ou annuler mon inscription ?",
    answer: (
      <p>
        <a href={contactHref} className={linkClassName}>Écrivez à l’équipe du tournoi</a> en indiquant
        le nom du joueur, son numéro de licence, les tableaux concernés et le changement souhaité.
      </p>
    ),
  },
  {
    question: "Puis-je m’inscrire sur place ?",
    answer: (
      <p>
        <a href={contactHref} className={linkClassName}>Contactez l’équipe du tournoi</a> avant de vous déplacer
        pour vérifier si les inscriptions sur place sont possibles et s’il reste des places dans vos tableaux.
      </p>
    ),
  },
  {
    question: "Que dois-je faire en arrivant le jour du tournoi ?",
    answer: (
      <p>
        Présentez-vous à l’accueil pour faire enregistrer votre présence avant le début de votre premier tableau.
        Si vous avez un solde à régler, signalez-le à l’équipe d’accueil.
      </p>
    ),
  },
];

export default function TournamentFaq() {
  return (
    <section id="faq" aria-labelledby="tournoi-faq-title" className="scroll-mt-28">
      <Card className="rounded-[1.8rem] border-border/70 bg-card/94 shadow-sm shadow-black/5">
        <CardHeader className="pb-3">
          <h2 id="tournoi-faq-title" className="font-serif text-3xl font-bold tracking-[-0.03em]">
            Questions fréquentes sur le tournoi
          </h2>
        </CardHeader>
        <CardContent className="divide-y divide-border/70">
          {questions.map(({ question, answer }) => (
            <details key={question} name="tournoi-faq" className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-base [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-open:rotate-180" />
              </summary>
              <div className="max-w-prose pb-4 text-sm leading-relaxed text-muted-foreground">
                {answer}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
