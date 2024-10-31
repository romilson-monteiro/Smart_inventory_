import crypto from "crypto"

const algorithm = 'sha256'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'

// Função para gerar hash de senha
export const encrypt = (password) => {
  const hash = crypto.createHash(algorithm).update(password).digest('hex');
  return hash;
};

// Função para comparar hashes
export const compareHashes = (hash1, hash2) => {
  // Compara os dois hashes para verificar se são iguais
  return hash1 === hash2;
};

