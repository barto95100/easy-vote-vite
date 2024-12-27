// Vérification par fingerprint d'abord
const existingVoteByFingerprint = await prisma.vote.findFirst({
  where: {
    pollId,
    fingerprint
  }
});

if (existingVoteByFingerprint) {
  return res.status(400).json({
    message: 'Vous avez déjà voté pour ce sondage depuis cet appareil'
  });
}

// Ensuite vérification par IP
const existingVoteByIP = await prisma.vote.findFirst({
  where: {
    pollId,
    ip
  }
});

if (existingVoteByIP) {
  return res.status(400).json({
    message: 'Un vote a déjà été enregistré depuis cette adresse IP'
  });
} 